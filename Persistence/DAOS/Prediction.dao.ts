import { Container } from "../Containers/Mongo.container";
import { LeanDocument } from "mongoose";
import {
  PredictionT,
  Prediction,
  PredictionDocument,
} from "../Models/Prediction.model";
import { PredictionDTO } from "../../DTOS/Prediction/PredictionPost.dto";
import { CustomError } from "../../Middleware/Errors/CustomError";

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
