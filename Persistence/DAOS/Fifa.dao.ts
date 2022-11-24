import axios from "axios";
import { FifaContainer, MatchesByCategory } from "../Containers/Fifa.container";
import { Match } from "../../DTOS/Fixture/fifa.match.dto";
import { CustomError } from "../../Middleware/Errors/CustomError";
import "dotenv/config";

export interface Stage {
  id: string;
  name: string;
  matches: Match[] | null;
  groups: MatchesByCategory[] | null;
}

export class FifaDAO extends FifaContainer {
  private _SEASON_ID: string = process.env.SEASON_ID || "255711";
  private _GROUP_STAGE: string = process.env.GROUP_STAGE_ID || "285063";
  private _apiUrl: string = "https://api.fifa.com/api/v3/";
  static START_DATES: { [key: string]: Date } = {};

  constructor() {
    super();
  }

  async getAllMatches(lang: string = "es"): Promise<Match[]> {
    const data = await axios.get(
      `${this._apiUrl}/calendar/matches?idSeason=${this._SEASON_ID}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected"
      );
    return this.normalizeMatches(data.data.Results);
  }

  async getMatchesById(
    ids: string[] | string,
    lang: string = "es"
  ): Promise<Match[]> {
    const idList = ids instanceof Array ? ids : [ids];
    const matches = await this.getAllMatches(lang);
    return matches.filter((match) => idList.includes(match.id));
  }

  async getAllStages(lang: string = "es"): Promise<Stage[]> {
    const matches = await this.getAllMatches(lang);
    const stages = this.groupByStage(matches);
    if (stages.length !== 6) throw new CustomError(500, "");
    return stages.map((stage) => {
      if (stage.id === this._GROUP_STAGE)
        return {
          id: stage.id,
          name: stage.name,
          matches: null,
          groups: this.groupByGroup(stage.matches),
        };
      return { ...stage, groups: null };
    });
  }

  async getOneStage(id: string, lang: string = "es"): Promise<Match[]> {
    const data = await axios.get(
      `${this._apiUrl}calendar/matches?idSeason=${this._SEASON_ID}&idStage=${id}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected"
      );
    return this.normalizeMatches(data.data.Results);
  }

  async getAllGroups(lang: string = "es"): Promise<MatchesByCategory[]> {
    const matches = await this.getOneStage(this._GROUP_STAGE, lang);
    return this.groupByGroup(matches);
  }

  async getOneGroup(id: string, lang: string = "es"): Promise<Match[]> {
    const data = await axios.get(
      `${this._apiUrl}calendar/matches?idSeason=${this._SEASON_ID}&idStage=${this._GROUP_STAGE}&idGroup=${id}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected"
      );
    return this.normalizeMatches(data.data.Results);
  }

  async getStageStartDates(lang: string = "es") {
    if (Object.entries(FifaDAO.START_DATES).length > 0)
      return FifaDAO.START_DATES;
    const stages = await this.getAllStages(lang);
    const result: { [key: string]: Date } = {};
    stages.forEach((stage) => {
      let stageMatches: Match[] | undefined =
        stage.matches ||
        stage.groups?.flatMap((group) => {
          return group.matches;
        });
      stageMatches?.sort((a, b) => a.date.getTime() - b.date.getTime());
      if (stageMatches) result[stage.id] = stageMatches[0].date;
    });
    FifaDAO.START_DATES = result;
    return result;
  }
  async getLiveData(id: string, stageId: string, lang: string = "es") {
    const data = await axios.get(
      `${this._apiUrl}/live/football/17/${this._SEASON_ID}/${stageId}/${id}?language=${lang}`
    );
    return this.normalizeLiveMatch(data.data);
  }
}
