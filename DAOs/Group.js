import Model from '../Models/Group.js'
import Container from '../Containers/mongoDB.js'
import Score from './Scores.js'

class Group extends Container {
    constructor() {
        super(Model)
    }
    async createGroup(data, user) {
        try {
            if(!data.name) throw new Error('Group name is required')
            if(!user._id) throw new Error('No user')
            if(data.name.length > 20) throw new Error('Group name is too long')
            const nameExists = await this.getOne({name: data.name.toUpperCase()})
            if(nameExists) throw new Error('Group name already in use')
            const newGroup = await this.create({
                name: data.name.toUpperCase(),
                owner: user._id,
                members: [user._id]
            })
            if(!newGroup) throw new Error('Failed to create group')
            const score = await Score.createGroupScore(newGroup._id, user._id)
            if(score.error) throw new Error(score.error)
            return newGroup
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async addMember(groupName, user) {
        try {
            if(!groupName) throw new Error('No group')
            if(!user._id) throw new Error('No user')
            const group = await this.getOne({name: groupName.toUpperCase()})
            if(!group) throw new Error('Group not found')
            if(group.members.includes(user._id)) throw new Error('User already in group')
            group.addMember(user._id)
            const result = await group.save()
            if(!result) throw new Error('Failed to add member')
            const score = await Score.createGroupScore(result._id, user._id)
            if(score.error) throw new Error(score.error)
            return result
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getScores(groupName) {
        try {
            if(!groupName) throw new Error('No group')
            const group = await this.getOne({name: groupName.toUpperCase()})
            if(!group) throw new Error('Group not found')
            const scores = await Score.getGroupScores(group._id)
            if(scores.error) throw new Error(scores.error)
            return scores
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getMembers(groupName) {
        try {
            if(!groupName) throw new Error('No group')
            const group = await this.getOne({name: groupName.toUpperCase()})
            if(!group) throw new Error('Group not found')
            return group.members
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getGroups(user_id) {
        try {
            if(!user_id) throw new Error('No user')
            const groups = await this.getMany({}, 'members name owner')
            if(!groups) throw new Error('No groups')
            return groups.filter(group => group.members.includes(user_id))
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async removeMember(groupName, user_id) {
        try {
            if(!groupName) throw new Error('No group')
            if(!user_id) throw new Error('No user')
            const group = await this.getOne({name: groupName.toUpperCase()})
            if(!group) throw new Error('Group not found')
            if(!group.members.includes(user_id)) throw new Error('User not in group')
            if(group.owner === user_id) {
                if(group.members.length === 1) throw new Error('Cannot remove admin from group')
                const otherMembers = group.members.filter(member => member !== user_id)
                const changedOwner = await this.update(group._id, {owner: otherMembers[0]})
                if(!changedOwner) throw new Error('Failed to change admin')
            }
            const edited = await this.update(group._id, {'$pull': {members: user_id}})
            if(!edited) throw new Error('Failed to remove member')
            const score = await Score.getOne({groupId: group._id, userId: user_id})
            await Score.delete(score._id)
            return edited
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getAllForUser(user_id, fields=null) {
        try {
            const result = await this.getMany({members: user_id}, fields);
            return result
        }
        catch(err) {
            return {error: err.message}
        }
    }
}

const GroupDAO =  new Group()
export default GroupDAO