import { PredictionDAO } from "../Persistence/DAOS/Prediction.dao";
import { GroupDAO } from "../Persistence/DAOS/Group.dao";
import { Scores } from "../Persistence/Repositories/Scores.repository";
import { PredictionDTO } from "../DTOS/Prediction/PredictionPost.dto";
import {
  PredictionT,
  PredictionDocument,
} from "../Persistence/Models/Prediction.model";
import {
  PredictionAndFifa,
  IPredictionData,
  IPredictionLengthByStage,
} from "../Persistence/Repositories/PredictionAndFifa.respository";
import { Validated } from "./validated.util";
import { CustomError } from "../Middleware/Errors/CustomError";
import { LeanDocument } from "mongoose";
import { ExtraPredictionsDAO } from "../Persistence/DAOS/ExtraPredictions.dao";
import { t } from "i18next";

interface IManyPredictionIn {
  userGroupId: PredictionT["userGroupId"];
  prediction: IPredictionData[];
}

interface IPredictionError {
  id: string;
  message: string;
}

interface IManyPredictionsResponse {
  created: LeanDocument<PredictionDocument>[];
  edited: LeanDocument<PredictionDocument>[];
  errors: IPredictionError[];
}

interface IExtraPredictionsIn {
  [key: string]: string;
}

class PredictionService extends Validated {
  predictions = new PredictionDAO();
  predictionsWithMatches = new PredictionAndFifa();
  groups = new GroupDAO();
  extraPredictions = new ExtraPredictionsDAO();
  scores = new Scores();

  constructor() {
    super();
  }
  async createOne(predictionData: IPredictionData, userId: string) {
    if (!userId || !predictionData.matchId)
      throw new CustomError(400, "Missing data");
    if (
      !this.arePositiveNumbers([
        predictionData.awayScore,
        predictionData.homeScore,
      ])
    )
      throw new CustomError(400, "Scores must be positive numbers");
    if (
      !(await this.predictionsWithMatches.validateSinglePrediction(
        predictionData.matchId,
        predictionData.userGroupId
      ))
    )
      throw new CustomError(
        406,
        "Your time to edit this prediction has expired"
      );
    return this.predictions.createPrediction(
      new PredictionDTO({
        ...predictionData,
        userId,
      })
    );
  }
  async createMultiple(
    predictionData: IManyPredictionIn,
    userId: string
  ): Promise<IManyPredictionsResponse> {
    if (!predictionData.userGroupId || !userId)
      throw new CustomError(
        400,
        "Missing data",
        "User group ID and user are required"
      );
    const { validated, expired, empty, scoreErrors } =
      await this.predictionsWithMatches.validateManyPredictions(
        predictionData.prediction,
        predictionData.userGroupId
      );
    const errors = [
      ...expired.map((exp) => ({
        id: exp.matchId,
        message: t("Your time to edit this prediction has expired"),
      })),
      ...scoreErrors.map((err) => ({
        id: err.matchId,
        message: t("Scores must be positive numbers"),
      })),
      ...empty.map((empty) => ({
        id: empty.matchId,
        message: t("Missing field"),
      })),
    ];
    const valid =
      validated.length > 0
        ? await this.predictions.createMany(
            validated.map(
              (validPrediction) =>
                new PredictionDTO({
                  ...validPrediction,
                  userGroupId: predictionData.userGroupId,
                  userId,
                })
            )
          )
        : { edited: [], created: [] };
    return {
      edited: valid.edited,
      created: valid.created,
      errors,
    };
  }
  async editPrediction(
    predictionId: string | undefined,
    predictionData: PredictionT,
    userId: string
  ): Promise<string> {
    if (
      !userId ||
      !predictionData.matchId ||
      !predictionData.userGroupId ||
      !predictionId
    )
      throw new CustomError(400, "Missing data");
    if (
      !this.arePositiveNumbers([
        predictionData.awayScore,
        predictionData.homeScore,
      ])
    )
      throw new CustomError(400, "Scores must be positive numbers");
    if (
      !(await this.predictionsWithMatches.validateSinglePrediction(
        predictionData.matchId,
        predictionData.userGroupId
      ))
    )
      throw new CustomError(
        406,
        "Your time to edit this prediction has expired"
      );
    const edited = await this.predictions.editPrediction(
      predictionId,
      predictionData
    );
    if (!edited) throw new CustomError(500, "Failed to edit prediction");
    return edited;
  }
  async fetchAllPredictions(
    userId: string,
    userGroupId: string | undefined,
    stageId: string | undefined,
    groupId: string | undefined,
    justOwn: boolean
  ) {
    if (!userId) throw new CustomError(401, "Missing user");
    let predictions: LeanDocument<PredictionDocument>[] | null = [];
    if (userGroupId) {
      if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
        throw new CustomError(401, "User not in group");
      predictions = justOwn
        ? await this.predictions.getAllByUserInGroup(userId, userGroupId)
        : await this.predictions.getAllInGroup(userGroupId);
    } else predictions = await this.predictions.getAllByUser(userId);
    if (!predictions || predictions.length < 1) return [];
    return this.predictionsWithMatches.filterForStageOrGroup(
      predictions,
      stageId,
      groupId
    );
  }
  async fetchUserPredictionLengthByStage(
    userId: string,
    userGroupId: string | undefined
  ): Promise<IPredictionLengthByStage> {
    let predictions: LeanDocument<PredictionDocument>[] | null;
    if (userGroupId) {
      if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
        throw new CustomError(401, "User not in group");
      predictions = await this.predictions.getAllByUserInGroup(
        userId,
        userGroupId
      );
    } else predictions = await this.predictions.getAllByUser(userId);
    return this.predictionsWithMatches.getPredictionCountForStages(predictions);
  }
  async fetchUserPredictionCount(userId: string): Promise<number> {
    if (!userId) throw new CustomError(401, "Missing user");
    return this.predictions.count({ userId: userId });
  }
  async fetchRandomUnpredictedMatch(userId: string) {
    if (!userId) throw new CustomError(401, "Missing user");
    const userGroups = await this.groups.getGroups(userId);
    if (!userGroups || userGroups.length < 1)
      throw new CustomError(204, "No groups found");
    userGroups.sort((a, b) => 0.5 - Math.random());
    for await (let group of userGroups) {
      const predicted = await this.predictions.getAllByUserInGroup(
        userId,
        group._id.toString()
      );
      const result =
        await this.predictionsWithMatches.getRandomUnpredictedMatch(
          predicted,
          group.rules?.timeLimit
        );
      if (predicted?.length === 0) console.log(group.name, result);
      if (result) return { group, match: result };
    }
    return null;
  }
  async deletePredictionById(
    predictionId: string | undefined,
    userId: string
  ): Promise<void> {
    if (!userId || !predictionId) throw new CustomError(400, "Missing data");
    if (!(await this.predictions.removePrediction(predictionId, userId)))
      throw new CustomError(500, "Failed to remove prediction");
  }
  async fetchOthersPredictions(
    userId: string,
    userGroupId: string | undefined,
    otherUserId: string | undefined
  ) {
    if (!userId || !userGroupId || !otherUserId)
      throw new CustomError(400, "Missing data");
    if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
      throw new CustomError(401, "User not in group");
    const predictions = await this.predictions.getAllByUserInGroup(
      otherUserId,
      userGroupId
    );
    if (!predictions) return [];
    return this.predictionsWithMatches.matchEvaluatedUserPredictionToMatches(
      userGroupId,
      predictions
    );
  }
  async submitExtraPredictions(
    userId: string,
    userGroupId: string | undefined,
    predictions: IExtraPredictionsIn | undefined
  ) {
    if (!userId || !userGroupId || !predictions)
      throw new CustomError(400, "Missing data");
    const groupExtraPredictionsSet = await this.groups.getById(
      userGroupId,
      "extraPredictions"
    );
    if (!groupExtraPredictionsSet)
      throw new CustomError(404, "Group not found");
    if (!groupExtraPredictionsSet.extraPredictions)
      throw new CustomError(404, "Group extra predictions data not found");
    if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
      throw new CustomError(401, "User not in group");
    const predictionMap: Map<string, string> = new Map();
    groupExtraPredictionsSet.extraPredictions.forEach((EP) => {
      if (predictions[EP.key] && Date.now() < new Date(EP.timeLimit).getTime())
        predictionMap.set(EP.key, predictions[EP.key]);
    });
    return this.extraPredictions.createPredictions(
      userId,
      userGroupId,
      predictionMap
    );
  }
  async fetchUserExtraPredictions(
    userId: string,
    userGroupId: string | undefined
  ) {
    if (!userId || !userGroupId) throw new CustomError(400, "Missing data");
    if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
      throw new CustomError(401, "User not in group");
    return;
  }
  async fetchGroupExtraPredictions(
    userId: string,
    userGroupId: string | undefined,
    justOwn: boolean
  ) {
    if (!userId || !userGroupId) throw new CustomError(400, "Missing data");
    if (!(await this.groups.checkForUserInGroup(userGroupId, userId)))
      throw new CustomError(401, "User not in group");
    if (justOwn)
      return this.extraPredictions.getAllByUserInGroup(userGroupId, userId);
    const groupData = await this.groups.getById(userGroupId);
    if (!groupData) throw new CustomError(404, "Group not found");
    return this.scores.getExtraPredictionsResultsByUser(groupData);
  }
}

export const predictionService = new PredictionService();
