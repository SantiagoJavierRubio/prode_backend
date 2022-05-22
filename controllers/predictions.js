import Prediction from '../DAOs/Prediction.js'
import { getStageCode } from '../utils/traslateNamesToCodes.js'
import { predictionsByStage } from '../utils/predictionPresentation.js'

export const create = async (req, res) => {
    try {
        const userId = await req.user._id
        let result
        if(req.body.multiple) {
            const predictionData = {
                userId: userId,
                groupId: req.body.groupId,
                predictions: req.body.prediction
            }
            result = await Prediction.createMany(predictionData)
        }
        else result = await Prediction.createPrediction({ ...req.body.prediction, userId: userId })
        if(result.error) throw new Error(result.error)
        res.status(200).json(result)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const edit = async (req, res) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.editPrediction(req.params.id, userId, req.body.prediction)
        if(result.error) throw new Error(result.error)
        res.sendStatus(200)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const editMany = async (req, res) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.editMany(userId, req.body.prediction)
        if(result.error) throw new Error(result.error)
        res.status(200).json(result)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const getAll = async (req, res) => {
    try {
        const user = await req.user
        const groupId = req.query.groupId || null
        if(groupId) {
            if(!user.groups.includes(groupId)) throw new Error('User not allowed to see this group')
            const result = await Prediction.getAllInGroup(groupId)
            return res.send(result)
        }
        const result = await Prediction.getAllByUser(user._id)
        return res.send(result)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const remove = async (req, res) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.removePrediction(req.params.id, userId)
        if(result.error) throw new Error(res.error)
        res.sendStatus(200)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const getPreviousForStage = async (req, res) => {
    try {
        const user = await req.user
        if(!req.query.stageId) throw new Error('Stage required')
        const stageId = getStageCode(req.query.stageId)
        const predictions = await Prediction.getAllByUser(user._id)
        if(predictions.error) throw new Error(result.error)
        const result = await predictionsByStage(predictions, stageId)
        console.log('Result de predictionsByStage', result) // TODO borrar
        if(result.error) throw new Error(result.error)
        res.send(result)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}