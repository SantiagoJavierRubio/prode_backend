import { Match } from "../Fixture/fifa.match.dto";
import { LeanDocument } from "mongoose";
import {
  PredictionDocument,
  PredictionT,
} from "../../Persistence/Models/Prediction.model";

export class PredictionAndMatch {
  matchId: PredictionT["matchId"];
  date: Match["date"];
  away: Match["away"];
  home: Match["home"];
  homeScore: PredictionT["homeScore"];
  awayScore: PredictionT["awayScore"];
  checked: PredictionT["checked"];
  score: PredictionT["score"];
  userGroupId: PredictionT["userGroupId"];
  userId: PredictionT["userId"];
  constructor(match: Match, prediction: LeanDocument<PredictionDocument>) {
    this.matchId = match.id;
    this.date = match.date;
    this.away = match.away;
    this.home = match.home;
    this.homeScore = prediction.homeScore;
    this.awayScore = prediction.awayScore;
    this.checked = prediction.checked;
    this.score = prediction.score;
    this.userGroupId = prediction.userGroupId;
    this.userId = prediction.userId;
  }
}
