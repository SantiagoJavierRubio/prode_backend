import Prediction from '../DAOs/Prediction.js'
import Group from '../DAOs/Group.js'
import { getStageCode, getGroupCode } from '../utils/traslateNamesToCodes.js'
import { 
    predictionsByStage,
    filterForOneGroup, 
    filterForOneStage,
    matchPredictionsToMatches,
    getPredictionQuantityForStages
} from '../utils/predictionPresentation.js'
import CustomError from '../Errors/CustomError.js'
import errorHandler from '../Errors/errorHandler.js'

export const create = async (req, res, next) => {
    try {
        const userId = await req.user._id
        let result
        if(req.body.multiple) {
            const predictionData = {
                userId: userId,
                userGroupId: req.body.userGroupId,
                predictions: req.body.prediction
            }
            result = await Prediction.createMany(predictionData)
        }
        else result = await Prediction.createPrediction({ ...req.body.prediction, userId: userId })
        res.status(200).json(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const edit = async (req, res, next) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.editPrediction(req.params.id, userId, req.body.prediction)
        if(result.error) throw new CustomError(result.code || 500, result.error)
        res.sendStatus(200)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const editMany = async (req, res, next) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.editMany(userId, req.body.prediction)
        res.status(200).json(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const getAll = async (req, res, next) => {
    try {
        const user = await req.user
        const userGroupId = req.query.userGroupId || null
        const stageId = req.query.stage ? getStageCode(req.query.stage) : null
        const groupId = req.query.group ? getGroupCode(req.query.group) : null
        let result
        if(userGroupId) {
            await Group.checkForUserInGroup(userGroupId, user._id)
            result = await Prediction.getAllByUserInGroup(user._id, userGroupId)
        }
        else {
            result = await Prediction.getAllByUser(user._id)
        }
        if (stageId) result = await filterForOneStage(result, stageId)
        else if (groupId) result = await filterForOneGroup(result, groupId)
        return res.send(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const getLengthOfUserPredictions = async (req, res, next) => {
    try {
        const user = await req.user
        const userGroupId = req.query.userGroupId || null
        let predictions
        if (userGroupId) {
            await Group.checkForUserInGroup(userGroupId, user._id)
            predictions = await Prediction.getAllByUserInGroup(user._id, userGroupId);
        }
        else predictions = await Prediction.getAllByUser(user._id)
        const payload = await getPredictionQuantityForStages(predictions)
        return res.send(payload)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const getOtherUsers = async (req, res, next) => {
    try {
        const user = await req.user;
        const userGroupId = req.query.userGroupId;
        const profileUser = req.params.id
        await Group.checkForUserInGroup(userGroupId, user._id)
        const predictions = await Prediction.getAllByUserInGroup(profileUser, userGroupId)
        const result = await matchPredictionsToMatches(predictions)
        return res.send(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const remove = async (req, res, next) => {
    try {
        const userId = await req.user._id
        await Prediction.removePrediction(req.params.id, userId)
        res.sendStatus(200)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const getPreviousForStage = async (req, res, next) => {
    try {
        const user = await req.user
        const stageId = getStageCode(req.query.stageId)
        const predictions = await Prediction.getAllByUser(user._id)
        const result = await predictionsByStage(predictions, stageId)
        res.send(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}