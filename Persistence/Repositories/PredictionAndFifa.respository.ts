import { CustomError } from "../../Middleware/Errors/CustomError";
import { FifaDAO } from "../DAOS/Fifa.dao";
import { GroupDAO } from "../DAOS/Group.dao";
import { PredictionT, PredictionDocument } from "../Models/Prediction.model";
import { LeanDocument } from "mongoose";
import { fifaCodes } from "../../utils/fifaCodes";
import e from "express";

export interface IPredictionData {
  matchId: PredictionT["matchId"];
  homeScore: PredictionT["homeScore"];
  awayScore: PredictionT["awayScore"];
}

export interface IManyPredictionValidate {
  valid: IPredictionData[];
  expired: IPredictionData[];
}

export class PredictionAndFifa {
  private fifa = new FifaDAO(true);
  private groups = new GroupDAO();

  async validateSinglePrediction(
    matchId: string,
    userGroupId: string
  ): Promise<boolean> {
    const groupRules = await this.groups.getById(userGroupId, "rules");
    if (!groupRules) throw new CustomError(404, "Group not found");
    const match = await this.fifa.getMatchesById(matchId);
    if (!match[0]) throw new CustomError(404, "Match doesn't exist");
    const now = Date.now();
    const matchDate = match[0].date.getTime();
    return now + (groupRules.rules?.timeLimit || 0) < matchDate;
  }

  async validateManyPredictions(
    predictions: IPredictionData[],
    userGroupId: string
  ): Promise<IManyPredictionValidate> {
    const result: IManyPredictionValidate = {
      valid: [],
      expired: [],
    };
    const groupRules = await this.groups.getById(userGroupId, "rules");
    if (!groupRules) throw new CustomError(404, "Group not found");
    const matches = await this.fifa.getMatchesById(
      predictions.map((prediction) => prediction.matchId)
    );
    if (!matches) throw new CustomError(500, "Failed to obtain matches");
    const now = Date.now();
    const validMatchIds = matches.map((match) => {
      if (now + (groupRules.rules?.timeLimit || 0) < match.date.getTime())
        return match.id;
    });
    predictions.forEach((prediction) => {
      if (validMatchIds.includes(prediction.matchId))
        result.valid = [...result.valid, prediction];
      else result.expired = [...result.expired, prediction];
    });
    return result;
  }
  async filterForStageOrGroup(
    predictions: LeanDocument<PredictionDocument>[],
    stageId: string | undefined,
    groupId: string | undefined
  ): Promise<LeanDocument<PredictionDocument>[]> {
    if (stageId) {
      const matches = await this.fifa.getOneStage(
        fifaCodes.getStageCode(stageId)
      );
      const stageMatchesIds = matches.map((match) => match.id);
      return predictions.filter((prediction) =>
        stageMatchesIds.includes(prediction.matchId)
      );
    } else if (groupId) {
      const matches = await this.fifa.getOneGroup(
        fifaCodes.getGroupCode(groupId)
      );
      const groupMatchesIds = matches.map((match) => match.id);
      return predictions.filter((prediction) =>
        groupMatchesIds.includes(prediction.matchId)
      );
    } else return predictions;
  }
}
