import { PredictionT } from "../../Persistence/Models/Prediction.model";

interface IPredictionInput {
  userId: PredictionT["userId"];
  matchId: PredictionT["matchId"];
  userGroupId: PredictionT["userGroupId"];
  homeScore: PredictionT["homeScore"];
  awayScore: PredictionT["awayScore"];
}

export class PredictionDTO {
  userId: PredictionT["userId"];
  matchId: PredictionT["matchId"];
  userGroupId: PredictionT["userGroupId"];
  homeScore: PredictionT["homeScore"];
  awayScore: PredictionT["awayScore"];

  constructor(input: IPredictionInput) {
    this.userId = input.userId;
    this.matchId = input.matchId;
    this.userGroupId = input.userGroupId;
    this.homeScore = input.homeScore;
    this.awayScore = input.awayScore;
  }
}
