import Group from '../DAOs/Group.js'
import User from '../DAOs/User.js'
import { scoresWithUsername } from '../utils/scoresPresentation.js'
import getOwnerNames from '../utils/getOwnerNames.js'

export const create = async (req, res) => {
    try {
        const groupData = req.body
        if(!groupData.name) throw new Error('Group name is required')
        const user = await req.user
        const newGroup = await Group.createGroup(groupData, user)
        if(newGroup.error) throw new Error(newGroup.error)
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
        const result = await Group.addMember(groupName, user)
        if(result.error) throw new Error(result.error)
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
        const removedFromGroup = await Group.removeMember(groupName, user._id)
        if(removedFromGroup.error) throw new Error(removedFromGroup.error)
        res.json({message: 'User removed from group'})
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}
export const getGroupData = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        if(groupName) {
            const result = await Group.getOne({name: groupName}, 'name members owner')
            if(!result) throw new Error('No groups')
            if(result.error) throw new Error(result.error)
            if(!result.members.includes(req.user._id)) return res.status(401).json({ error: 'User not in group' })
            const members = await User.getManyById(result.members, 'name email')
            if(!members) throw new Error('Failed to get members')
            const payload = {name: result.name, members, owner: members.filter(member => member._id == result.owner)[0]}
            res.json({groupData: payload})
        } 
        else {
            const groups = await Group.getGroups(req.user._id)
            if(groups.error) throw new Error(groups.error)
            const withOwnerNames = await getOwnerNames(groups)
            if(withOwnerNames.error) throw new Error(withOwnerNames.error)
            res.send(withOwnerNames)
        }
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}