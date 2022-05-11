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
            const nameExists = await this.getOne({name: data.name})
            if(nameExists) throw new Error('Group name already in use')
            const newGroup = await this.create({
                name: data.name,
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
            const group = await this.getOne({name: groupName})
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
            const group = await this.getOne({name: groupName})
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
            const group = await this.getOne({name: groupName})
            if(!group) throw new Error('Group not found')
            return group.members
        }
        catch(err) {
            return {error: err.message}
        }
    }
}

const GroupDAO =  new Group()
export default GroupDAO