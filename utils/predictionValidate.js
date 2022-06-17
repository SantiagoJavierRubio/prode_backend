import GroupDAO from '../DAOs/Group.js';
import FifaRepository from '../DAOs/Repositories/FifaRepository.js'

const fifa = new FifaRepository();

export const validatePredictions = async (predictions, userGroupId) => {
    const matchIds = await predictions.map(prediction => prediction.matchId)
    const matches = await fifa.getMatchesById(matchIds)
    const groupRules = await GroupDAO.getById(userGroupId, 'rules')
    const maxDateAcceptable = Date.now() + groupRules.rules.timeLimit
    const validMatchIds = await matches.map(match => {
        const date = new Date(match.date)
        if(maxDateAcceptable < date) return match.id
    })
    const result = { valid: [], expired: [] }
    await predictions.forEach(prediction => {
        if(validMatchIds.includes(prediction.matchId)) result.valid.push(prediction)
        else result.expired.push(prediction)
    })
    return result
}