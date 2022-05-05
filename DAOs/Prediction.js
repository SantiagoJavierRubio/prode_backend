import Model from '../Models/Prediction.js'
import Container from '../Containers/mongoDB.js'

class Prediction extends Container {
    constructor() {
        super(Model)
    }
    async createPrediction(data) {
        try {
            if(!data.matchId || !data.groupId || !data.homeScore || !data.awayScore) throw new Error('Missing fields')
            const prediction = await this.getOne({matchId: data.matchId, userId: data.userId})
            if(prediction) throw new Error('Prediction already exists')
            return await this.create({...data})
        } 
        catch(err) {
            return {error: err.message}
        }
    }
    async getAllByUser(userId) {
        try {
            const results = await this.getMany({userId: userId})
            if (!results) return null;
            return results;
        }
     catch (err) {
            return {error: err.message}
        }
    }
    async getAllInGroup(groupId) {
        try {
            const results = await this.getMany({groupId: groupId})
            if (!results) return null;
            return results;
        }
     catch (err) {
            return {error: err.message}
        }
    }
    async getAllByUserInGroup(userId, groupId) {
        try {
            const results = await this.getMany({userId: userId, groupId: groupId})
            if (!results) return null;
            return results;
        }
        catch (err) {
            return {error: err.message}
        }
    }
    async editPrediction(id, userId, data) {
        try {
            const original = await this.getById(id)
            if(!original) throw new Error('Prediction not found')
            if(original.userId != userId) throw new Error('User not allowed to edit this prediction')
            return await this.update(id, {...data, edited: Date.now()})
        }
     catch (err) {
            return {error: err.message}
        }
    }
    async removePrediction(id, userId) {
        try {
            const original = await this.getById(id)
            if(!original) throw new Error('Prediction not found')
            if(original.userId != userId) throw new Error('User not allowed to remove this prediction')
            return await this.delete(id)
        }
        catch(err) {
            return {error: err.message}
        }
    }
}

const PredictionDAO = new Prediction()
export default PredictionDAO

