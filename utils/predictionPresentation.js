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
    //if(predictionsByStage.length === 0) throw new CustomError(404, 'No predictions for this stage');
    const result = await showByGroupName(predictionsByStage);
    return result;
}

export const filterForOneStage = async (predictions, stageId) => {
    if(hasNulls([predictions, stageId])) throw new CustomError(406, 'Missing field')
    const matches = await fifa.getOneStage(stageId);
    const stageMatchesIds = await matches.map(match => match.id);
    const predictionsByStage = await predictions.filter(prediction => stageMatchesIds.includes(prediction.matchId));
    //if(predictionsByStage.length === 0) throw new CustomError(404, 'No predictions for this stage');
    return predictionsByStage;
}

export const filterForOneGroup = async (predictions, groupId) => {
    if(hasNulls([predictions, groupId])) throw new CustomError(406, 'Missing field')
    const matches = await fifa.getOneGroup(groupId);
    const groupMatchesIds = await matches.map(match => match.id);
    const predictionsByStage = await predictions.filter(prediction => groupMatchesIds.includes(prediction.matchId));
    //if(predictionsByStage.length === 0) throw new CustomError(404, 'No predictions for this group');
    return predictionsByStage;
}