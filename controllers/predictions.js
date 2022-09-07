import Prediction from "../DAOs/Prediction.js";
import Group from "../DAOs/Group.js";
import { getStageCode, getGroupCode } from "../utils/traslateNamesToCodes.js";
import {
  predictionsByStage,
  filterForOneGroup,
  filterForOneStage,
  matchPredictionsToMatches,
  getPredictionQuantityForStages,
} from "../utils/predictionPresentation.js";
import { randomUnpredictedMatch } from "../utils/randomUnpredictedMatch.js";
import CustomError from "../Errors/CustomError.js";
import errorHandler from "../Errors/errorHandler.js";

export const create = async (req, res, next) => {
  try {
    const userId = await req.user._id;
    let result;
    if (req.body.multiple) {
      const predictionData = {
        userId: userId,
        userGroupId: req.body.userGroupId,
        predictions: req.body.prediction,
      };
      result = await Prediction.createMany(predictionData);
    } else
      result = await Prediction.createPrediction({
        ...req.body.prediction,
        userId: userId,
      });
    res.status(200).json(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const edit = async (req, res, next) => {
  try {
    const userId = await req.user._id;
    const result = await Prediction.editPrediction(
      req.params.id,
      userId,
      req.body.prediction
    );
    if (result.error) throw new CustomError(result.code || 500, result.error);
    res.sendStatus(200);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const editMany = async (req, res, next) => {
  try {
    const userId = await req.user._id;
    const result = await Prediction.editMany(userId, req.body.prediction);
    res.status(200).json(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const getAll = async (req, res, next) => {
  try {
    const user = await req.user;
    const userGroupId = req.query.userGroupId || null;
    const stageId = req.query.stage ? getStageCode(req.query.stage) : null;
    const groupId = req.query.group ? getGroupCode(req.query.group) : null;
    const justOwn = req.query.own?.toLowerCase() === "true";
    let result;
    if (userGroupId) {
      await Group.checkForUserInGroup(userGroupId, user._id);
      result = justOwn
        ? await Prediction.getAllByUserInGroup(user._id, userGroupId)
        : await Prediction.getAllInGroup(userGroupId);
    } else {
      result = await Prediction.getAllByUser(user._id);
    }
    if (stageId) result = await filterForOneStage(result, stageId);
    else if (groupId) result = await filterForOneGroup(result, groupId);
    return res.send(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const getLengthOfUserPredictions = async (req, res, next) => {
  try {
    const user = await req.user;
    const userGroupId = req.query.userGroupId || null;
    let predictions;
    if (userGroupId) {
      await Group.checkForUserInGroup(userGroupId, user._id);
      predictions = await Prediction.getAllByUserInGroup(user._id, userGroupId);
    } else predictions = await Prediction.getAllByUser(user._id);
    const payload = await getPredictionQuantityForStages(predictions);
    return res.send(payload);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const getOtherUsers = async (req, res, next) => {
  try {
    const user = await req.user;
    const userGroupId = req.query.userGroupId;
    const profileUser = req.params.id;
    await Group.checkForUserInGroup(userGroupId, user._id);
    const groupRules = await Group.getById(userGroupId, "-_id rules");
    const predictions = await Prediction.getAllByUserInGroup(
      profileUser,
      userGroupId
    );
    const result = await matchPredictionsToMatches(
      predictions,
      groupRules.rules
    );
    return res.send(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const remove = async (req, res, next) => {
  try {
    const userId = await req.user._id;
    await Prediction.removePrediction(req.params.id, userId);
    res.sendStatus(200);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
export const getPreviousForStage = async (req, res, next) => {
  try {
    const user = await req.user;
    const stageId = getStageCode(req.query.stageId);
    const predictions = await Prediction.getAllByUser(user._id);
    const result = await predictionsByStage(predictions, stageId);
    res.send(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

const filterRandomUnpredictedByGroup = async (groups, userID) => {
  const userGroups = [...groups];
  for (let i = 0; i < userGroups.length + 1; i++) {
    const randIndex = Math.floor(Math.random() * userGroups.length);
    const randGroup = userGroups[randIndex];
    userGroups.splice(randIndex, 1);
    const predicted = await Prediction.getAllByUserInGroup(
      userID,
      randGroup._id,
      "-_id matchId"
    );
    const result = await randomUnpredictedMatch(
      predicted,
      randGroup.rules.timeLimit
    );
    if (result) return { group: randGroup, match: result };
  }
  return null;
};

export const getRandomUnpredictedMatch = async (req, res, next) => {
  try {
    const user = await req.user;
    const userGroups = await Group.getAllForUser(user._id, "name rules");
    if (userGroups.length < 1) throw new CustomError(404, "No groups found");
    const result = await filterRandomUnpredictedByGroup(userGroups, user._id);
    if (!result) return res.sendStatus(404);
    res.send(result);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const getUserPredictionLength = async (req, res, next) => {
  try {
    const user = await req.user;
    const result = await Prediction.model.countDocuments({ userId: user._id });
    res.json({ userPredictions: result });
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
