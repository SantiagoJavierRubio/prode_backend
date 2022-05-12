import Group from '../DAOs/Group.js'
import User from '../DAOs/User.js'
import { scoresWithUsername } from '../utils/scoresPresentation.js'

export const create = async (req, res) => {
    try {
        const groupData = req.body
        if(!groupData.name) throw new Error('Group name is required')
        const user = await req.user
        const newGroup = await Group.createGroup(groupData, user)
        if(newGroup.error) throw new Error(newGroup.error)
        const addedToGroup = await User.joinGroup(user._id, groupData.name)
        if(addedToGroup.error) throw new Error(addedToGroup.error)
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
        if(user.groups.includes(groupName)) throw new Error('User already in group')
        const addedToGroup = await User.joinGroup(user._id, groupName)
        if(!addedToGroup) throw new Error('Failed to add user to group')
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
        const removedFromGroup = await User.leaveGroup(user._id, groupName)
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
        if(!groupName) throw new Error('No group')
        const result = await Group.getOne({name: groupName}, 'name members owner')
        if(!result) throw new Error('Group not found')
        const members = await User.getManyById(result.members, 'name email')
        if(!members) throw new Error('Failed to get members')
        const payload = {name: result.name, members, owner: members.filter(member => member._id == result.owner)}
        res.json({groupData: payload})
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}