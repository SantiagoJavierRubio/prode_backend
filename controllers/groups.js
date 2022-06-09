import Group from '../DAOs/Group.js'
import User from '../DAOs/User.js'
import { calculateScoresByUsername } from '../utils/scoresPresentation.js'
import getOwnerNames from '../utils/getOwnerNames.js'
import CustomError from '../Errors/CustomError.js'
import errorHandler from '../Errors/errorHandler.js'
import Prediction from '../DAOs/Prediction.js'

export const create = async (req, res, next) => {
    try {
        const groupData = req.body
        const user = await req.user
        const newGroup = await Group.createGroup(groupData, user)
        res.status(201).json(newGroup)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const join = async (req, res, next) => {
    try {
        const groupName = req.query.groupName;
        const user = await req.user
        const result = await Group.addMember(groupName, user)
        res.status(200).json(result)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const getScores = async (req, res, next) => {
    try {
        const groupName = req.query.groupName;
        const groupData = await Group.getOne({name: groupName.toUpperCase()})
        const predictions = await Prediction.getAllScoredInGroup(groupData._id)
        const scoresByUser = await calculateScoresByUsername(predictions, groupData)
        const ownerName = await User.getById(groupData.owner, 'name')
        res.status(200).json({
            group: {
                name: groupName,
                owner: ownerName.name
            },
            scores: scoresByUser
        })
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const leaveGroup = async (req, res, next) => {
    try {
        const groupName = req.query.groupName;
        const user = await req.user
        const userGroupId = await Group.removeMember(groupName, user._id)
        await Prediction.removeAllByUserInGroup(user._id, userGroupId)
        res.json({message: 'User removed from group'})
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}
export const deleteGroup = async (req, res, next) => {  
    try {
        const userGroupId = req.query.userGroupId;
        const user = await req.user;
        await Group.deleteGroup(userGroupId, user._id);
        res.json({message: 'Group deleted'})
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const getGroupData = async (req, res, next) => {
    try {
        const groupName = req.query.groupName;
        if(groupName) {
            const result = await Group.getOne({name: groupName}, 'name members owner')
            if(!result) throw new CustomError(404, 'No groups found')
            if(!result.members.includes(req.user._id)) throw new CustomError(401, 'You are not a member of this group')
            const members = await User.getManyById(result.members, 'name email avatar')
            if(!members) throw new CustomError(404, 'No members found')
            const payload = {name: result.name, members, owner: members.filter(member => member._id == result.owner)[0]}
            res.json({groupData: payload})
        } 
        else {
            const groups = await Group.getGroups(req.user._id)
            const withOwnerNames = await getOwnerNames(groups)
            res.send(withOwnerNames)
        }
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}