import Fifa from '../DAOs/Fifa.js'
import { getGroupCode, getStageCode } from '../utils/traslateNamesToCodes.js';
import errorHandler from '../Errors/errorHandler.js';

export const getFixture = async (req, res, next) => {
    try {
        const payload = {}
        const groupId = req.query.groupId || null;
        const stageId = req.query.stageId || null;
        if(groupId) {
            const groupCode = getGroupCode(groupId)
            payload.fixture = await Fifa.getOneGroup(groupCode)
        }
        else if (stageId) {
            const stageCode = getStageCode(stageId)
            payload.fixture = await Fifa.getOneStage(stageCode)
        } 
        else payload.fixture = await Fifa.getAllStages()
        res.json(payload)
    } 
    catch (err) {
        errorHandler(err, req, res, next)
    }
}

export const getGroups = async (req, res, next) => {
    try {
        const payload = { fixture: await Fifa.getAllGroups() }
        res.json(payload)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}