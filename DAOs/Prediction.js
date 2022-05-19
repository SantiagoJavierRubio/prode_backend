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
            return await this.create({
                ...data,
                homeScore: parseInt(data.homeScore),
                awayScore: parseInt(data.awayScore)
            })
        } 
        catch(err) {
            return {error: err.message}
        }
    }
    async createMany(data) {
        try {
            const predictions = await this.getAllByUserInGroup(data.userId, data.groupId)
            if(predictions.error) throw new Error(predictions.error.message)
            const response = {
                created: [],
                errors: []
            }
            const validPredictions = []
            await data.predictions.forEach(prediction => {
                if (!prediction.matchId) 
                    return response.errors.push({id: null, message: 'Missing matchId'})
                if (!prediction.groupId || !prediction.homeScore || !prediction.awayScore) 
                    return response.errors.push({id: prediction.matchId, message: 'Missing field'})
                if (predictions.find(p => p.matchId === prediction.matchId))
                    return response.errors.push({id: prediction.matchId, message: 'Prediction already exists'})
                validPredictions.push({
                    ...prediction,
                    userId: data.userId,
                    homeScore: parseInt(prediction.homeScore),
                    awayScore: parseInt(prediction.awayScore)
                })
            })
            const created = await this.createMultiple(validPredictions)
            if(created.error) throw new Error(created.error.message)
            response.created = [...created]
            return response
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
            if(!id || !userId || !data) throw new Error('Missing fields')
            const original = await this.getById(id)
            if(!original) throw new Error('Prediction not found')
            if(original.userId != userId) throw new Error('User not allowed to edit this prediction')
            return await this.update(id, {
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                edited: Date.now()
            })
        }
     catch (err) {
            return {error: err.message}
        }
    }
    async editMany(userId, array) {
        try {
            const response = {
                edited: [],
                errors: []
            };
            for (let prediction of array) {
                if(!prediction.id) {
                    response.errors.push({id: null, message: 'Missing id'})
                    continue
                } 
                let result = await this.editPrediction(prediction.id, userId, prediction.data);
                if(!result) {
                    response.errors.push({id: prediction.id, message: 'Prediction not found'})
                    continue
                }
                if(result.error) {
                    response.errors.push({id: prediction.id, message: result.error});
                    continue
                }
                response.edited.push(prediction.id);
            }
            return response;
        }
        catch(err) {
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
    async checkPredictions(ids) {
        try {
            const updated = await this.model.updateMany({_id: {$in: ids}}, {checked: true})
            if(!updated) throw new Error('Failed to check predictions')
            return updated
        }
        catch(err) {
            return {error: err.message}
        }
    }
}

const PredictionDAO = new Prediction()
export default PredictionDAO

