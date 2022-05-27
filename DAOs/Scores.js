import Model from '../Models/Scores.js'
import Container from '../Containers/mongoDB.js'

class Scores extends Container {
    constructor() {
        super(Model)
    }
    async createGroupScore(userGroupId, userId) {
        try {
            if(!userGroupId) throw new Error('No group')
            if(!userId) throw new Error('No user')
            const exists = await this.getOne({userGroupId: userGroupId, userId: userId})
            if(exists) throw new Error('Score already exists')
            const newScore = await this.create({userGroupId: userGroupId, userId: userId})
            if(!newScore) throw new Error('Failed to create score')
            return newScore
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getGroupScores(userGroupId) {
        try {
            if(!userGroupId) throw new Error('No group')
            const scores = await this.getMany({userGroupId: userGroupId})
            if(!scores) throw new Error('No scores')
            return scores
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async getUserScores(userId) {
        try {
            if(!userId) throw new Error('No user')
            const scores = await this.getMany({userId: userId})
            if(!scores) throw new Error('No scores')
            return scores
        }
        catch(err) {
            return {error: err.message}
        }
    }
    async addScore(userGroupId, userId, score) {
        try {
            if(!userGroupId) throw new Error('No group')
            if(!userId) throw new Error('No user')
            if(!score) throw new Error('No score')
            const exists = await this.getOne({userGroupId: userGroupId, userId: userId})
            if(!exists) throw new Error('No score')
            const newScore = exists.score + parseInt(score)
            const updated = await this.update(exists._id, {score: newScore})
            if(!updated) throw new Error('Failed to update score')
            return updated
        }
        catch(err) {
            return { error: err.message }
        }
    }
}

const ScoresDAO = new Scores()
export default ScoresDAO