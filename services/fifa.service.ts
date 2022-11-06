import { FifaDAO } from "../Persistence/DAOS/Fifa.dao";
import { fifaCodes } from "../utils/fifaCodes";
import { Team, Match } from "../DTOS/Fixture/fifa.match.dto";
import __ from "i18next";
import "dotenv/config";

interface FixtureStatusI {
  [key: string]: boolean;
}

class FifaService {
  private fifa = new FifaDAO();
  async fetchFixture(groupId: string | null, stageId: string | null) {
    if (groupId)
      return await this.fifa.getOneGroup(
        fifaCodes.getGroupCode(groupId),
        __.language
      );
    if (stageId)
      return await this.fifa.getOneStage(
        fifaCodes.getStageCode(stageId),
        __.language
      );
    return await this.fifa.getAllStages(__.language);
  }
  async fetchGroups() {
    return await this.fifa.getAllGroups(__.language);
  }
  async checkFixtureStatus(): Promise<FixtureStatusI> {
    const payload: FixtureStatusI = {
      GRUPOS: false,
      OCTAVOS: false,
      CUARTOS: false,
      SEMIFINAL: false,
      FINAL: false,
      TERCER_PUESTO: false,
    };
    const matches = await this.fifa.getAllMatches(__.language);
    for (let match of matches) {
      if (payload[fifaCodes.getStageName(match.stageId)]) continue;
      if (match.home instanceof Team) {
        payload[fifaCodes.getStageName(match.stageId)] = true;
      }
    }
    return payload;
  }
  async fetchNextMatches(quantity: number): Promise<Match[]> {
    const allMatches = await this.fifa.getAllMatches(__.language);
    const now = Date.now();
    return allMatches
      .filter(
        (match) =>
          match?.home instanceof Team &&
          match?.away instanceof Team &&
          now < match?.date.getTime()
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, quantity);
  }
}

export const fifaService = new FifaService();
