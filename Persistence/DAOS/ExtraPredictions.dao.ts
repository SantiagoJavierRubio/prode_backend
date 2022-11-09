import { Container } from "../Containers/Mongo.container";
import {
  ExtraPrediction,
  ExtraPredictionsT,
  ExtraPredictionsDocument,
} from "../Models/ExtraPredictions.model";
import { CustomError } from "../../Middleware/Errors/CustomError";

export class ExtraPredictionsDAO extends Container<ExtraPredictionsDocument> {
  constructor() {
    super(ExtraPrediction);
  }
  async createPredictions(
    userId: string,
    userGroupId: string,
    predictions: ExtraPredictionsT["predictions"]
  ) {
    const existing = await this.getOne({ userId, userGroupId });
    if (existing) {
      await this.update(existing._id, { predictions });
      return this.getById(existing._id);
    } else return this.create({ userId, userGroupId, predictions });
  }
  async editById(
    userId: string,
    predictionId: string,
    predictions: ExtraPredictionsT["predictions"]
  ) {
    const existing = await this.getById(predictionId);
    if (!existing) throw new CustomError(404, "Predictions not found");
    if (existing.userId !== userId)
      throw new CustomError(401, "You can't edit these predictions");
    await this.update(existing._id, { predictions });
    return this.getById(existing._id);
  }
  async getAllByGroup(userGroupId: string) {
    return this.getMany({ userGroupId });
  }
  async deleteAllByUserInGroup(userId: string, userGroupId: string) {
    return this.deleteMany({ userId, userGroupId });
  }
}
