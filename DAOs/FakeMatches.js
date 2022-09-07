import Container from "../Containers/fifa.js";
import FakeMatch from "./FakeData/FakeModels/fakeMatch.js";

class FakeMatchDTO {
  constructor(data) {
    this.id = data.id || `${data._id}`;
    this.stage = data.stage;
    this.stageId = data.stageId;
    this.group = data.group;
    this.groupId = data.groupId;
    this.home = data.home;
    this.away = data.away;
    this.homeScore = data.homeScore;
    this.awayScore = data.awayScore;
    this.stadiumId = data.stadiumId;
    this.stadium = data.stadium;
    this.date = data.date;
    this.status = data.status;
    this.winner = data.winner;
  }
}

class FakeFifaDAO extends Container {
  constructor() {
    super();
    this.GROUP_STAGE = "111111";
  }
  async getAllMatches(lang) {
    const matches = await FakeMatch.find().lean();
    return matches.map((match) => new FakeMatchDTO(match));
  }
  async getMatchesById(ids, lang) {
    const matches = await FakeMatch.find({ _id: { $in: ids } }).lean();
    return matches.map((match) => new FakeMatchDTO(match));
  }
  async getAllStages(lang) {
    const matches = await FakeMatch.find().lean();
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
    const normalizedMatches = stages[indexGroups].matches.map(
      (match) => new FakeMatchDTO(match)
    );
    stages[indexGroups].groups = this.groupByGroup(normalizedMatches);
    delete stages[indexGroups].matches;
    const normalizedMatchesStages = stages.map((stage) => {
      if (stage.groups) return stage;
      return {
        ...stage,
        matches: stage.matches.map((match) => new FakeMatchDTO(match)),
      };
    });
    return normalizedMatchesStages;
  }
  async getOneStage(id, lang) {
    const matches = await FakeMatch.find({ stageId: id }).lean();
    return matches.map((match) => new FakeMatchDTO(match));
  }
  async getAllGroups(lang) {
    const response = await this.getOneStage(this.GROUP_STAGE);
    return this.groupByGroup(response);
  }
  async getOneGroup(id, lang) {
    const matches = await FakeMatch.find({ groupId: id }).lean();
    return matches.map((match) => new FakeMatchDTO(match));
  }
}

export default FakeFifaDAO;
