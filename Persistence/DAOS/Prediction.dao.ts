import { Container } from "../Containers/Mongo.container";
import { LeanDocument } from "mongoose";
import { Prediction, PredictionDocument } from "../Models/Prediction.model";
import { PredictionDTO } from "../../DTOS/Prediction/PredictionPost.dto";
import { CustomError } from "../../Middleware/Errors/CustomError";

interface ICreateManyResponse {
  created: LeanDocument<PredictionDocument>[];
  edited: LeanDocument<PredictionDocument>[];
}

export class PredictionDAO extends Container<PredictionDocument> {
  constructor() {
    super(Prediction);
  }
  async createPrediction(
    data: PredictionDTO
  ): Promise<LeanDocument<PredictionDocument> | null> {
    const prediction = await this.getOne({
      matchId: data.matchId,
      userId: data.userId,
      userGroupId: data.userGroupId,
    });
    if (prediction) {
      await this.update(prediction._id, data);
      return this.getById(prediction._id);
    } else return this.create(data);
  }
  async createMany(data: PredictionDTO[]): Promise<ICreateManyResponse> {
    const matchIds = data.map((prediction) => prediction.matchId);
    const existing = await this.getMany(
      {
        userId: data[0].userId,
        userGroupId: data[0].userGroupId,
        matchId: { $in: matchIds },
      },
      "matchId"
    );
    let edited: LeanDocument<PredictionDocument>[] = [];
    existing?.forEach(async (existingPrediction) => {
      const newData = data.find(
        (prediction) => prediction.matchId === existingPrediction.matchId
      );
      if (newData) {
        await this.update(existingPrediction._id, { ...newData });
        edited = [...edited, existingPrediction];
      }
    });
    const created = (await this.createMultiple(data)) || [];
    return {
      edited,
      created,
    };
  }
  async editPrediction(
    predictionId: string,
    data: PredictionDTO
  ): Promise<string | null> {
    const exists = await this.getById(predictionId);
    if (!exists) return null;
    await this.update(predictionId, data);
    return exists._id.toString();
  }
  async removePrediction(
    predictionId: string,
    userId: string
  ): Promise<boolean> {
    const original = await this.getById(predictionId);
    if (!original) throw new CustomError(404, "Prediction not found");
    if (original.userId != userId)
      throw new CustomError(401, "User not allowed to remove this prediction");
    await this.delete(predictionId);
    return true;
  }
  async removeManyByUser(userId: string, condition: object): Promise<void> {
    return this.deleteMany({ ...condition, userId: userId });
  }
  async getAllByUser(
    userId: string
  ): Promise<LeanDocument<PredictionDocument>[] | null> {
    return this.getMany({ userId: userId });
  }
  async getAllInGroup(
    userGroupId: string
  ): Promise<LeanDocument<PredictionDocument>[] | null> {
    return this.getMany({
      userGroupId: userGroupId,
      checked: true,
    });
  }
  async getAllByUserInGroup(
    userId: string,
    userGroupId: string
  ): Promise<LeanDocument<PredictionDocument>[] | null> {
    return this.getMany({
      userId: userId,
      userGroupId: userGroupId,
    });
  }
  async getSomeByUserInGroup(
    userId: string,
    userGroupId: string,
    matchIds: string[]
  ): Promise<LeanDocument<PredictionDocument>[] | null> {
    return this.getMany({
      userId: userId,
      userGroupId: userGroupId,
      matchId: {
        $in: matchIds,
      },
    });
  }
  async scorePrediction(predictionId: string, score: number): Promise<void> {
    const prediction = await this.getById(predictionId);
    if (!prediction) throw new CustomError(404, "Prediction not found");
    if (prediction.checked)
      throw new CustomError(406, "Prediction already checked");
    return this.update(predictionId, { score: score, checked: true });
  }
  async checkMultiplePredictions(predictionIds: string[]): Promise<void> {
    return this.updateMany(predictionIds, { checked: true });
  }
}
