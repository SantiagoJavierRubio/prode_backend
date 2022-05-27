import Model from '../Models/Scores.js'
import Container from '../Containers/mongoDB.js'
import { hasNulls } from '../utils/dataCheck.js'
import CustomError from '../Errors/CustomError.js'

class Scores extends Container {
    constructor() {
        super(Model)
    }
    async createGroupScore(userGroupId, userId) {
        if(hasNulls([userGroupId, userId])) throw new CustomError(406, 'Missing field')
        const exists = await this.getOne({userGroupId: userGroupId, userId: userId})
        if(exists) throw new CustomError(409, 'Score already exists')
        const newScore = await this.create({userGroupId: userGroupId, userId: userId})
        if(!newScore) throw new CustomError(500, 'Failed to create score')
        return newScore
    }
    async getGroupScores(userGroupId) {
        if(hasNulls([userGroupId])) throw new CustomError(406, 'Missing user group id')
        const scores = await this.getMany({userGroupId: userGroupId})
        if(!scores) throw new CustomError(404, 'No scores found')
        return scores
    }
    async getUserScores(userId) {
        if(hasNulls([userId])) throw new CustomError(406, 'Missing user id')
        const scores = await this.getMany({userId: userId})
        if(!scores) throw new CustomError(404, 'No scores found')
        return scores
    }
    async addScore(userGroupId, userId, score) {
        if(hasNulls([userGroupId, userId, score])) throw new CustomError(406, 'Missing field')
        const exists = await this.getOne({userGroupId: userGroupId, userId: userId})
        if(!exists) throw new CustomError(404, 'Score not found')
        const newScore = exists.score + parseInt(score)
        const updated = await this.update(exists._id, {score: newScore})
        if(!updated) throw new CustomError(500, 'Failed to update score')
        return updated
    }
}

const ScoresDAO = new Scores()
export default ScoresDAO