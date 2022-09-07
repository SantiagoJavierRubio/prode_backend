import axios from "axios";
import Container from "../Containers/fifa.js";
import CustomError from "../Errors/CustomError.js";

class Fifa extends Container {
  constructor(actual) {
    super();
    this.SEASON_ID = actual ? "254645" : "255711";
    this.GROUP_STAGE = actual ? "275073" : "285063";
    this.apiUrl = "https://api.fifa.com/api/v1/";
  }
  async getAllMatches(lang = "es") {
    const data = await axios.get(
      `${this.apiUrl}/calendar/matches?idSeason=${this.SEASON_ID}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected",
        { response: data }
      );
    return this.normalizeMatches(data.data.Results);
  }
  async getMatchesById(ids, lang = "es") {
    const idList = ids[0] ? ids : [ids];
    const matches = await this.getAllMatches(lang);
    return matches.filter((match) => idList.includes(match.id));
  }
  async getAllStages(lang = "es") {
    const matches = await this.getAllMatches(lang);
    const stages = this.groupByStage(matches);
    let indexGroups = stages.findIndex(
      (stage) => stage.id === this.GROUP_STAGE
    );
    if (indexGroups === -1)
      throw new CustomError(
        500,
        "Failed to arrange stage",
        "This error should not happen"
      );
    stages[indexGroups].groups = this.groupByGroup(stages[indexGroups].matches);
    delete stages[indexGroups].matches;
    return stages;
  }
  async getOneStage(id, lang = "es") {
    const data = await axios.get(
      `${this.apiUrl}calendar/matches?idSeason=${this.SEASON_ID}&idStage=${id}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected",
        { response: data }
      );
    return this.normalizeMatches(data.data.Results);
  }
  async getAllGroups(lang = "es") {
    const matches = await this.getOneStage(this.GROUP_STAGE, lang);
    return this.groupByGroup(matches);
  }
  async getOneGroup(id, lang = "es") {
    const data = await axios.get(
      `${this.apiUrl}calendar/matches?idSeason=${this.SEASON_ID}&idStage=${this.GROUP_STAGE}&idGroup=${id}&count=100&language=${lang}`
    );
    if (!data.data?.Results)
      throw new CustomError(
        503,
        "Failed to obtain fixture",
        "Fifa api did not respond as expected",
        { response: data }
      );
    return this.normalizeMatches(data.data.Results);
  }
}

export default Fifa;
