import FifaRepository from '../DAOs/Repositories/FifaRepository.js';
import { getGroupCode, getStageCode } from '../utils/traslateNamesToCodes.js';
import errorHandler from '../Errors/errorHandler.js';

const fifa = new FifaRepository();

export const getFixture = async (req, res, next) => {
    try {
        const payload = {}
        const groupId = req.query.groupId || null;
        const stageId = req.query.stageId || null;
        if(groupId) {
            const groupCode = getGroupCode(groupId)
            payload.fixture = await fifa.getOneGroup(groupCode)
        }
        else if (stageId) {
            const stageCode = getStageCode(stageId)
            payload.fixture = await fifa.getOneStage(stageCode)
        } 
        else payload.fixture = await fifa.getAllStages()
        res.json(payload)
    } 
    catch (err) {
        errorHandler(err, req, res, next)
    }
}

export const getGroups = async (req, res, next) => {
    try {
        const payload = { fixture: await fifa.getAllGroups() }
        res.json(payload)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}