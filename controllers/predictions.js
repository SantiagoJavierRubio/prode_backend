import Prediction from '../DAOs/Prediction.js'

export const create = async (req, res) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.createPrediction({ ...req.body, userId: userId })
        if(result.error) throw new Error(result.error)
        res.send(result)
    }
    catch(err) {
        res.status(400).json({ error: err.message })
    }
}
export const edit = async (req, res) => {
    try {
        const userId = await req.user._id
        const result = await Prediction.editPrediction(req.params.id, userId, req.body)
        if(result.error) throw new Error(result.error)
        res.sendStatus(200)
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