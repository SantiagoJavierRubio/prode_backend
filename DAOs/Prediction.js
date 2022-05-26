import Model from '../Models/Prediction.js'
import Container from '../Containers/mongoDB.js'
import { hasNulls, arePositiveNumbers } from '../utils/dataCheck.js'

class Prediction extends Container {
    constructor() {
        super(Model)
    }
    checkPredictionData(prediction) {
        if(hasNulls([prediction.matchId, prediction.groupId, prediction.homeScore, prediction.awayScore])) return { check: false, error: 'Missing field' }
        if(!arePositiveNumbers([parseInt(prediction.homeScore), parseInt(prediction.awayScore)])) return { check: false, error: 'Invalid score' }
        return { check: true }
    }
    async createPrediction(data) {
        try {
            const check = this.checkPredictionData(data)
            if(!check.check) throw new Error(check.error)
            const prediction = await this.getOne({matchId: data.matchId, userId: data.userId})
            if(prediction) return await this.editPrediction(prediction._id, data.userId, data)
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
                edited: [],
                errors: []
            }
            const validPredictions = []
            const predictionsToEdit = []
            await data.predictions.forEach(prediction => {
                const check = this.checkPredictionData(prediction)
                if(!check.check) return response.errors.push({id: prediction.matchId, message: check.error})
                const existing = predictions.find(p => p.matchId === prediction.matchId)
                if(existing) return predictionsToEdit.push({data: {...prediction}, id: existing._id})
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
            const edited = await this.editMany(data.userId, predictionsToEdit)
            if(edited.error) throw new Error(created.error.message)
            response.edited = edited.edited
            response.errors = [...response.errors, ...edited.errors]
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
            if(!id || !userId) throw new Error('Missing fields')
            const check = this.checkPredictionData(data)
            if(!check.check) throw new Error(check.error)
            const original = await this.getById(id)
            if(!original) throw new Error('Prediction not found')
            if(original.userId != userId) throw new Error('User not allowed to edit this prediction')
            return await this.update(id, {
                homeScore: parseInt(data.homeScore),
                awayScore: parseInt(data.awayScore),
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

