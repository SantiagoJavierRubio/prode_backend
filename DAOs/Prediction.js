import Model from "../Models/Prediction.js";
import Container from "../Containers/mongoDB.js";
import i18n from "i18n";
import { hasNulls, arePositiveNumbers } from "../utils/dataCheck.js";
import CustomError from "../Errors/CustomError.js";
import { validatePredictions } from "../utils/predictionValidate.js";

class Prediction extends Container {
  constructor() {
    super(Model);
  }
  checkPredictionData(prediction) {
    if (
      hasNulls([
        prediction.matchId,
        prediction.userGroupId,
        prediction.homeScore,
        prediction.awayScore,
      ])
    )
      return { check: false, error: i18n.__("Missing field") };
    if (
      !arePositiveNumbers([
        parseInt(prediction.homeScore),
        parseInt(prediction.awayScore),
      ])
    )
      return {
        check: false,
        error: i18n.__("Scores must be positive numbers"),
      };
    return { check: true };
  }
  async createPrediction(data) {
    const check = this.checkPredictionData(data);
    if (!check.check) throw new CustomError(406, check.error);
    const prediction = await this.getOne({
      matchId: data.matchId,
      userId: data.userId,
      userGroupId: data.userGroupId,
    });
    const validation = await validatePredictions([data], data.userGroupId);
    if (validation.valid.length < 1)
      throw new CustomError(
        406,
        "Your time to edit this prediction has expired"
      );
    if (prediction)
      return await this.editPrediction(prediction._id, data.userId, data);
    return await this.create({
      ...data,
      homeScore: parseInt(data.homeScore),
      awayScore: parseInt(data.awayScore),
    });
  }
  async createMany(data) {
    const predictions = await this.getAllByUserInGroup(
      data.userId,
      data.userGroupId
    );
    const response = {
      created: [],
      edited: [],
      errors: [],
    };
    const validPredictions = [];
    const predictionsToEdit = [];
    const validation = await validatePredictions(
      data.predictions,
      data.userGroupId
    );
    validation.expired.forEach((p) =>
      response.errors.push({
        id: p.matchId,
        message: i18n.__("Your time to edit this prediction has expired"),
      })
    );
    await validation.valid.forEach((prediction) => {
      const check = this.checkPredictionData(prediction);
      if (!check.check)
        return response.errors.push({
          id: prediction.matchId,
          message: check.error,
        });
      const existing = predictions.find(
        (p) => p.matchId === prediction.matchId
      );
      if (existing)
        return predictionsToEdit.push({
          data: { ...prediction },
          id: existing._id,
        });
      validPredictions.push({
        ...prediction,
        userId: data.userId,
        homeScore: parseInt(prediction.homeScore),
        awayScore: parseInt(prediction.awayScore),
      });
    });
    const created = await this.createMultiple(validPredictions);
    response.created = [...created];
    const edited = await this.editMany(data.userId, predictionsToEdit);
    response.edited = edited.edited;
    response.errors = [...response.errors, ...edited.errors];
    return response;
  }
  async getAllByUser(userId) {
    if (hasNulls([userId])) throw new CustomError(406, "User id is missing");
    const results = await this.getMany({ userId: userId });
    if (!results) return null;
    return results;
  }
  async getAllInGroup(userGroupId) {
    if (hasNulls([userGroupId]))
      throw new CustomError(406, "User group id is missing");
    const results = await this.getMany({
      userGroupId: userGroupId,
      checked: true,
    });
    if (!results) return null;
    return results;
  }
  async getAllByUserInGroup(userId, userGroupId, fields = null) {
    if (hasNulls([userId, userGroupId]))
      throw new CustomError(406, "Missing data");
    const results = await this.getMany(
      { userId: userId, userGroupId: userGroupId },
      fields
    );
    if (!results) return null;
    return results;
  }
  async getAllScoredInGroup(userGroupId) {
    if (hasNulls([userGroupId]))
      throw new CustomError(406, "User group id is missing");
    const results = await this.getMany({
      userGroupId: userGroupId,
      checked: true,
    });
    if (!results) return null;
    return results;
  }
  async removeAllByUserInGroup(userId, userGroupId) {
    if (hasNulls([userId, userGroupId]))
      throw new CustomError(406, "Missing field");
    const predictionsForGroup = await this.getMany(
      { userId: userId, userGroupId: userGroupId },
      "_id"
    );
    if (!predictionsForGroup) return;
    await this.model.deleteMany({ _id: { $in: predictionsForGroup } });
  }
  async editPrediction(id, userId, data) {
    if (hasNulls([id, userId]))
      return { error: i18n.__("Missing field"), code: 406 };
    const check = this.checkPredictionData(data);
    if (!check.check) return { error: check.error };
    const original = await this.getById(id);
    if (!original) return { error: i18n.__("Prediction not found"), code: 404 };
    if (original.userId != userId)
      return {
        error: i18n.__("User not allowed to edit this prediction"),
        code: 401,
      };
    const validation = await validatePredictions([data], data.userGroupId);
    if (validation.valid.length < 1)
      return {
        error: i18n.__("Your time to edit this prediction has expired"),
        code: 406,
      };
    return await this.update(id, {
      homeScore: parseInt(data.homeScore),
      awayScore: parseInt(data.awayScore),
      edited: Date.now(),
    });
  }
  async editMany(userId, array) {
    const response = {
      edited: [],
      errors: [],
    };
    for (let prediction of array) {
      if (!prediction.id) {
        response.errors.push({ id: null, message: i18n.__("Missing id") });
        continue;
      }
      let result = await this.editPrediction(
        prediction.id,
        userId,
        prediction.data
      );
      if (!result) {
        response.errors.push({
          id: prediction.id,
          message: i18n.__("Prediction not found"),
        });
        continue;
      }
      if (result.error) {
        response.errors.push({ id: prediction.id, message: result.error });
        continue;
      }
      response.edited.push(prediction.id);
    }
    return response;
  }
  async removePrediction(id, userId) {
    if (hasNulls([id, userId])) throw new CustomError(406, "Missing field");
    const original = await this.getById(id);
    if (!original) throw new CustomError(404, "Prediction not found");
    if (original.userId != userId)
      throw new CustomError(401, "User not allowed to remove this prediction");
    return await this.delete(id);
  }
  async checkPredictions(ids) {
    if (hasNulls([ids]) || !id[0]) throw new CustomError(406, "Missing ids");
    const updated = await this.model.updateMany(
      { _id: { $in: ids } },
      { checked: true }
    );
    if (!updated) throw new CustomError(500, "Failed to check predictions");
    return updated;
  }
  async scorePrediction(id, score) {
    if (hasNulls([id, score])) throw new CustomError(406, "Missing field");
    const original = await this.getById(id);
    if (!original) throw new CustomError(404, "Prediction not found");
    if (original.checked)
      throw new CustomError(403, "Prediction already checked");
    return await this.update(id, { score: score, checked: true });
  }
}

const PredictionDAO = new Prediction();
export default PredictionDAO;
