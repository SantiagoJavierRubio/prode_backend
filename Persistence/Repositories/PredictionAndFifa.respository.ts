import { CustomError } from "../../Middleware/Errors/CustomError";
import { FifaDAO } from "../DAOS/Fifa.dao";
import { GroupDAO } from "../DAOS/Group.dao";
import { PredictionT, PredictionDocument } from "../Models/Prediction.model";
import { LeanDocument } from "mongoose";
import { fifaCodes } from "../../utils/fifaCodes";
import { Match, Team } from "../../DTOS/Fixture/fifa.match.dto";
import { PredictionAndMatch } from "../../DTOS/Prediction/PredictionAndMatch.dto";
import __ from "i18next";

export interface IPredictionData {
  matchId: PredictionT["matchId"];
  homeScore: PredictionT["homeScore"];
  awayScore: PredictionT["awayScore"];
  userGroupId: PredictionT["userGroupId"];
}

export interface IManyPredictionValidate {
  validated: IPredictionData[];
  expired: IPredictionData[];
  empty: IPredictionData[];
  scoreErrors: IPredictionData[];
}

interface ISingleStagePredictionLength {
  predicted: number;
  total: number;
}
export interface IPredictionLengthByStage {
  [key: string]: ISingleStagePredictionLength;
  GRUPOS: ISingleStagePredictionLength;
  OCTAVOS: ISingleStagePredictionLength;
  CUARTOS: ISingleStagePredictionLength;
  SEMIFINAL: ISingleStagePredictionLength;
  FINAL: ISingleStagePredictionLength;
  TERCER_PUESTO: ISingleStagePredictionLength;
}

export class PredictionAndFifa {
  private fifa = new FifaDAO();
  private groups = new GroupDAO();

  async validateSinglePrediction(
    matchId: string,
    userGroupId: string
  ): Promise<boolean> {
    const groupRules = await this.groups.getById(userGroupId, "rules");
    if (!groupRules) throw new CustomError(404, "Group not found");
    const match = await this.fifa.getMatchesById(matchId, __.language);
    if (!match[0]) throw new CustomError(404, "Match doesn't exist");
    const stageStartDates = await this.fifa.getStageStartDates(__.language);
    if (groupRules.rules?.limitByPhase && !stageStartDates[match[0].stageId])
      throw new CustomError(404, "Phase start date not found");
    const now = Date.now();
    const matchDate = groupRules.rules?.limitByPhase
      ? stageStartDates[match[0].stageId].getTime()
      : match[0].date.getTime();
    return now + (groupRules.rules?.timeLimit || 0) < matchDate;
  }

  async validateManyPredictions(
    predictions: IPredictionData[],
    userGroupId: string
  ): Promise<IManyPredictionValidate> {
    const result: IManyPredictionValidate = {
      validated: [],
      expired: [],
      empty: [],
      scoreErrors: [],
    };
    const groupRules = await this.groups.getById(userGroupId, "rules");
    if (!groupRules) throw new CustomError(404, "Group not found");
    const matches = await this.fifa.getMatchesById(
      predictions.map((prediction) => prediction.matchId),
      __.language
    );
    if (!matches) throw new CustomError(500, "Failed to obtain matches");
    const now = Date.now();
    const stageStartDates = await this.fifa.getStageStartDates(__.language);
    const validMatchIds = matches.map((match) => {
      let matchDate = groupRules.rules?.limitByPhase
        ? stageStartDates[match.stageId].getTime()
        : match.date.getTime();
      if (now + (groupRules.rules?.timeLimit || 0) < matchDate) return match.id;
    });
    predictions.forEach((prediction) => {
      console.log(typeof prediction.homeScore);
      if (
        isNaN(prediction.homeScore) ||
        isNaN(prediction.awayScore) ||
        (typeof prediction.awayScore !== "number" &&
          isNaN(parseInt(prediction.awayScore))) ||
        (typeof prediction.homeScore !== "number" &&
          isNaN(parseInt(prediction.homeScore)))
      ) {
        result.empty = [...result.empty, prediction];
      } else if (prediction.homeScore < 0 || prediction.awayScore < 0) {
        result.scoreErrors = [...result.scoreErrors, prediction];
      } else if (validMatchIds.includes(prediction.matchId))
        result.validated = [...result.validated, prediction];
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
        fifaCodes.getStageCode(stageId),
        __.language
      );
      const stageMatchesIds = matches.map((match) => match.id);
      return predictions.filter((prediction) =>
        stageMatchesIds.includes(prediction.matchId)
      );
    } else if (groupId) {
      const matches = await this.fifa.getOneGroup(
        fifaCodes.getGroupCode(groupId),
        __.language
      );
      const groupMatchesIds = matches.map((match) => match.id);
      return predictions.filter((prediction) =>
        groupMatchesIds.includes(prediction.matchId)
      );
    } else return predictions;
  }
  async getPredictionCountForStages(
    predictions: LeanDocument<PredictionDocument>[] | null
  ): Promise<IPredictionLengthByStage> {
    const stages = await this.fifa.getAllStages(__.language);
    let result: IPredictionLengthByStage = {
      GRUPOS: {
        predicted: 0,
        total: 0,
      },
      CUARTOS: {
        predicted: 0,
        total: 0,
      },
      OCTAVOS: {
        predicted: 0,
        total: 0,
      },
      TERCER_PUESTO: {
        predicted: 0,
        total: 0,
      },
      FINAL: {
        predicted: 0,
        total: 0,
      },
      SEMIFINAL: {
        predicted: 0,
        total: 0,
      },
    };
    for (let stage of stages) {
      const stageName = fifaCodes.getStageName(stage.id);
      if (stageName === "GRUPOS") {
        stage.matches =
          stage.groups?.map((group) => group.matches).flat() || [];
      }
      result[stageName].total = stage.matches?.length || 0;
      const matchIds = stage.matches?.map((match) => match.id);
      if (!predictions) continue;
      result[stageName].predicted = predictions.filter((prediction) =>
        matchIds?.includes(prediction.matchId)
      ).length;
    }
    return result;
  }
  async getRandomUnpredictedMatch(
    predictions: LeanDocument<PredictionDocument>[] | null,
    timeLimit: number | undefined
  ): Promise<Match | null> {
    if (
      predictions === null ||
      predictions === undefined ||
      timeLimit === undefined
    )
      return null;
    const predictionMatchIds = predictions.map(
      (prediction) => prediction.matchId
    );
    const matches = await this.fifa.getAllMatches(__.language);
    const now = Date.now();
    const validFutureMatches = matches.filter(
      (match) =>
        match.home instanceof Team &&
        match.away instanceof Team &&
        now + timeLimit < match.date.getTime() &&
        !predictionMatchIds.includes(match.id)
    );
    if (validFutureMatches.length === 0) return null;
    return validFutureMatches[
      Math.floor(Math.random() * validFutureMatches.length)
    ];
  }
  async matchEvaluatedUserPredictionToMatches(
    userGroupId: string,
    predictions: LeanDocument<PredictionDocument>[]
  ): Promise<PredictionAndMatch[]> {
    const group = await this.groups.getById(userGroupId, "-_id rules");
    const matchIds = await predictions.map((prediction) => prediction.matchId);
    const matches = await this.fifa.getMatchesById(matchIds, __.language);
    const now = Date.now();
    const result: PredictionAndMatch[] = [];
    for (let prediction of predictions) {
      const match = matches.find((match) => {
        match.id === prediction.matchId;
      });
      if (
        !match ||
        !group?.rules?.timeLimit ||
        match.date.getTime() > now + group?.rules?.timeLimit
      )
        continue;
      result.push(new PredictionAndMatch(match, prediction));
    }
    return result;
  }
}
