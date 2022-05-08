import Group from '../DAOs/Group.js'
import User from '../DAOs/User.js'
import { scoresWithUsername } from '../utils/scoresPresentation.js'

export const create = async (req, res) => {
    try {
        const groupData = req.body
        if(!groupData.name) throw new Error('Group name is required')
        const user = await req.user
        const addedToGroup = await User.update(user._id, {groups: [...user.groups, groupData.name]})
        if(!addedToGroup) throw new Error('Failed to add user to group')
        const newGroup = await Group.createGroup(groupData, user)
        if(newGroup.error) {
            await User.update(user._id, {groups: user.groups})
            throw new Error(newGroup.error)
        } 
        res.status(201).json(newGroup)
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}
export const join = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        if(!groupName) throw new Error('No group')
        const user = await req.user
        const addedToGroup = await User.update(user._id, {groups: [...user.groups, groupName]})
        if(!addedToGroup) throw new Error('Failed to add user to group')
        const result = await Group.addMember(groupName, user)
        if(result.error) {
            await User.update(user._id, {groups: user.groups})
            throw new Error(result.error)
        }
        res.status(200).json(result)
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}
export const getScores = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        if(!groupName) throw new Error('No group')
        const result = await Group.getScores(groupName)
        if(result.error) throw new Error(result.error)
        const scoresByUser = await scoresWithUsername(result)
        if(scoresByUser.error) throw new Error(scoresByUser.error)
        res.status(200).json({
            group: groupName,
            scores: scoresByUser
        })
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}
export const leaveGroup = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        if(!groupName) throw new Error('No group')
        const user = await req.user
        const removedFromGroup = await User.update(user._id, {groups: user.groups.filter(group => group !== groupName)})
        if(!removedFromGroup) throw new Error('Failed to remove user from group')
        res.status(200)
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}