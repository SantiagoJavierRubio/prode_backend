import { PredictionDAO } from "../Persistence/DAOS/Prediction.dao";
import { GroupDAO } from "../Persistence/DAOS/Group.dao";
import { PredictionDTO } from "../DTOS/Prediction/PredictionPost.dto";
import {
  PredictionT,
  PredictionDocument,
} from "../Persistence/Models/Prediction.model";
import {
  PredictionAndFifa,
  IPredictionData,
} from "../Persistence/Repositories/PredictionAndFifa.respository";
import { Validated } from "./validated.util";
import { CustomError } from "../Middleware/Errors/CustomError";
import { LeanDocument } from "mongoose";

interface IOnePredictionIn {
  userGroupId: PredictionT["userGroupId"];
  prediction: IPredictionData;
}

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

// TODO: Abstract, generalize
const partition = (
  array: IPredictionData[],
  callback: (e: IPredictionData) => boolean
) =>
  array.reduce(
    (acc: IPredictionData[][], e) => {
      acc[callback(e) ? 0 : 1].push(e);
      return acc;
    },
    [[], []]
  );
//

class PredictionService extends Validated {
  predictions = new PredictionDAO();
  predictionsWithMatches = new PredictionAndFifa();
  groups = new GroupDAO();

  constructor() {
    super();
  }
  async createOne(predictionData: IOnePredictionIn, userId: string) {
    if (!userId || !predictionData.prediction.matchId)
      throw new CustomError(400, "Missing data");
    if (
      !this.arePositiveNumbers([
        predictionData.prediction.awayScore,
        predictionData.prediction.homeScore,
      ])
    )
      throw new CustomError(400, "Scores must be positive numbers");
    if (
      !(await this.predictionsWithMatches.validateSinglePrediction(
        predictionData.prediction.matchId,
        predictionData.userGroupId
      ))
    )
      throw new CustomError(
        406,
        "Your time to edit this prediction has expired"
      );
    return this.predictions.createPrediction(
      new PredictionDTO({
        ...predictionData.prediction,
        userGroupId: predictionData.userGroupId,
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
    const dateValidated =
      await this.predictionsWithMatches.validateManyPredictions(
        predictionData.prediction,
        predictionData.userGroupId
      );
    const [validated, scoreErrors] = partition(dateValidated.valid, (e) =>
      this.arePositiveNumbers([e.awayScore, e.homeScore])
    );
    const errors = [
      ...dateValidated.expired.map((exp) => ({
        id: exp.matchId,
        message: "Your time to edit this prediction has expired",
      })),
      ...scoreErrors.map((err) => ({
        id: err.matchId,
        message: "Scores must be positive numbers",
      })),
    ];
    const valid = await this.predictions.createMany(
      validated.map(
        (validPrediction) =>
          new PredictionDTO({
            ...validPrediction,
            userGroupId: predictionData.userGroupId,
            userId,
          })
      )
    );
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
    if (!predictions) return [];
    return this.predictionsWithMatches.filterForStageOrGroup(
      predictions,
      stageId,
      groupId
    );
  }
}

export const predictionService = new PredictionService();
