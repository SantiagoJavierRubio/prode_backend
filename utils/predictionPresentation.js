import FifaRepository from '../DAOs/Repositories/FifaRepository.js';
import Group from '../DAOs/Group.js';
import CustomError from '../Errors/CustomError.js';
import { hasNulls } from './dataCheck.js';

const fifa = new FifaRepository();

const showByGroupName = async (predictions) => {
    const groupNames =  await Group.getAllForUser(predictions[0].userId, 'name');
    const byGroups = {}
    await predictions.forEach(async prediction => {
        if(Object.keys(byGroups).includes(prediction.userGroupId)) {
            byGroups[prediction.userGroupId].push(prediction)
        }
        else {
            const groupInfo = groupNames.find(group => `${group._id}` === prediction.userGroupId)
            byGroups[`${prediction.userGroupId}`] = [groupInfo.name, prediction]
        }
    })
    return byGroups
}
 
export const predictionsByStage = async (predictions, stageId) => {
    if(hasNulls([predictions, stageId])) throw new CustomError(406, 'Missing field')
    const matches = await fifa.getOneStage(stageId);
    const stageMatchesIds = await matches.map(match => match.id);
    const predictionsByStage = await predictions.filter(prediction => stageMatchesIds.includes(prediction.matchId));
    const result = await showByGroupName(predictionsByStage);
    return result;
}

export const filterForOneStage = async (predictions, stageId) => {
    if(hasNulls([predictions, stageId])) throw new CustomError(406, 'Missing field')
    const matches = await fifa.getOneStage(stageId);
    const stageMatchesIds = await matches.map(match => match.id);
    const predictionsByStage = await predictions.filter(prediction => stageMatchesIds.includes(prediction.matchId));
    return predictionsByStage;
}

export const filterForOneGroup = async (predictions, groupId) => {
    if(hasNulls([predictions, groupId])) throw new CustomError(406, 'Missing field')
    const matches = await fifa.getOneGroup(groupId);
    const groupMatchesIds = await matches.map(match => match.id);
    const predictionsByStage = await predictions.filter(prediction => groupMatchesIds.includes(prediction.matchId));
    return predictionsByStage;
}

export const matchPredictionsToMatches = async (predictions) => {
    if(hasNulls([predictions])) throw new CustomError(406, 'Missing field')
    const matchIds =  await predictions.map((prediction) => prediction.matchId)
    const matches = await fifa.getMatchesById(matchIds);
    const result = await predictions.map(prediction => {
        const match = matches.filter(match => match.id === prediction.matchId)[0];
        return {
            matchId: prediction.matchId,
            date: match.date,
            away: match.away,
            home: match.home,
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore,
            checked: prediction.checked,
            score: prediction.score,
            userGroupId: prediction.userGroupId,
            userId: prediction.userId
        }
    })
    return result
}