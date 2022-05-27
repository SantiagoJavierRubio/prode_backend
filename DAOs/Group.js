import Model from '../Models/Group.js'
import Container from '../Containers/mongoDB.js'
import Score from './Scores.js'
import CustomError from '../Errors/CustomError.js'
import { hasNulls } from '../utils/dataCheck.js'

class Group extends Container {
    constructor() {
        super(Model)
    }
    async createGroup(data, user) {
        if(hasNulls([data.name, user._id])) throw new CustomError(406, 'Missing data')
        if(data.name.length > 20) throw new CustomError(406, 'Group name is too long', 'Group name must be less than 21 characters')
        const nameExists = await this.getOne({name: data.name.toUpperCase()})
        if(nameExists) throw new CustomError(409, 'Group name already in use')
        const newGroup = await this.create({
            name: data.name.toUpperCase(),
            owner: user._id,
            members: [user._id]
        })
        if(!newGroup) throw new CustomError(500, 'Failed to create group')
        await Score.createGroupScore(newGroup._id, user._id)
        return newGroup
    }
    async addMember(groupName, user) {
        if(hasNulls([groupName, user._id])) throw new CustomError(406, 'Missing data')
        const group = await this.getOne({name: groupName.toUpperCase()})
        if(!group) throw new CustomError(404, 'Group not found')
        if(group.members.includes(user._id)) throw new CustomError(409, 'User already in group')
        group.addMember(user._id)
        const result = await group.save()
        await Score.createGroupScore(result._id, user._id)
        return result
    }
    async getScores(groupName) {
        if(hasNulls([groupName])) throw new CustomError(406, 'No group name provided')
        const group = await this.getOne({name: groupName.toUpperCase()})
        if(!group) throw new CustomError(404, 'Group not found')
        const scores = await Score.getGroupScores(group._id)
        return scores
    }
    async getMembers(groupName) {
        if(hasNulls([groupName])) throw new CustomError(406, 'No group name provided')
        const group = await this.getOne({name: groupName.toUpperCase()})
        if(!group) throw new CustomError(404, 'Group not found')
        return group.members
    }
    async getGroups(user_id) {
        if(hasNulls([user_id])) throw new CustomError(406, 'No user id provided')
        const groups = await this.getMany({}, 'members name owner')
        if(!groups) throw new CustomError(404, 'Groups not found')
        return groups.filter(group => group.members.includes(user_id))
    }
    async removeMember(groupName, user_id) {
        if(hasNulls([groupName, user_id])) throw new CustomError(406, 'Missing data')
        const group = await this.getOne({name: groupName.toUpperCase()})
        if(!group) throw new CustomError(404, 'Group not found')
        if(!group.members.includes(user_id)) throw new CustomError(406, 'User not in group')
        if(group.owner === user_id) {
            if(group.members.length === 1) throw new CustomError(406, 'Cannot remove admin from group')
            const otherMembers = group.members.filter(member => member !== user_id)
            const changedOwner = await this.update(group._id, {owner: otherMembers[0]})
            if(!changedOwner) throw new CustomError(500, 'Failed to change admin')
        }
        const edited = await this.update(group._id, {'$pull': {members: user_id}})
        if(!edited) throw new CustomError(500, 'Failed to remove member')
        const score = await Score.getOne({userGroupId: group._id, userId: user_id})
        await Score.delete(score._id)
        return group._id
    }
    async getAllForUser(user_id, fields=null) {
        if(hasNulls([user_id])) throw new CustomError(406, 'No user id provided')
        const result = await this.getMany({members: user_id}, fields);
        return result
    }
    async checkForUserInGroup(id, user_id) {
        if(hasNulls([id, user_id])) throw new CustomError(406, 'Missing field')
        const group = await this.getOne({_id: id}, 'members')
        if(!group) throw new CustomError(404, 'Group not found')
        if(!group.members.includes(user_id)) throw new CustomError(401, 'User not in group')
        return true
    }
}

const GroupDAO =  new Group()
export default GroupDAO