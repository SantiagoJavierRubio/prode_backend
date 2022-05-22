import Fifa from '../DAOs/Fifa.js';
import Group from '../DAOs/Group.js';

const showByGroupName = async (predictions) => {
    try {
        // TODO Me parece que esto siempre devuelve "{}"
        const byGroups = {}
        await predictions.forEach(async prediction => {
            if(byGroups[prediction.groupId]) byGroups[prediction.groupId].push(prediction)
            else {
                const group = await Group.getById(prediction.groupId)
                if(!group) throw new Error('Group not found')
                byGroups[prediction.groupId] = [group.name, prediction]
            }
        })
        return byGroups
    }
    catch(err) {
        return {error: err.message}
    }
}
 
export const predictionsByStage = async (predictions, stageId) => {
    try {
        const matches = await Fifa.getOneStage(stageId);
        if(matches.error) throw new Error(matches.error);
        const stageMatchesIds = await matches.map(match => match.id);
        const predictionsByStage = await predictions.filter(prediction => stageMatchesIds.includes(prediction.matchId));
        if(predictionsByStage.length === 0) return { error: 'No predictions for this stage' };
        const result = await showByGroupName(predictionsByStage);
        if(result.error) throw new Error(result.error)
        return result;
    }
    catch(err) {
        return { error: err.message }
    }
}