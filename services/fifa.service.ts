import { FifaDAO } from "../Persistence/DAOS/Fifa.dao";
import { fifaCodes } from "../utils/fifaCodes";
import { Team } from "../DTOS/Fixture/fifa.match.dto";

class FifaService {
  private fifa = new FifaDAO(true);
  async fetchFixture(groupId: string | null, stageId: string | null) {
    if (groupId)
      return await this.fifa.getOneGroup(fifaCodes.getGroupCode(groupId));
    if (stageId)
      return await this.fifa.getOneStage(fifaCodes.getStageCode(stageId));
    return await this.fifa.getAllStages();
  }
  async fetchGroups() {
    return await this.fifa.getAllGroups();
  }
  async checkFixtureStatus() {
    const payload = {
      GRUPOS: false,
      OCTAVOS: false,
      CUARTOS: false,
      SEMIFINAL: false,
      FINAL: false,
      TERCER_PUESTO: false,
    };
    const stages = await this.fifa.getAllStages();
  }
  async fetchNextMatches(quantity: number) {
    const allMatches = await this.fifa.getAllMatches();
    const now = Date.now();
    return allMatches
      .filter((match) => {
        match?.home instanceof Team &&
          match?.away instanceof Team &&
          now < match?.date.getTime();
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, quantity);
  }
}

export const fifaService = new FifaService();
