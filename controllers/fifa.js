import Fifa from '../DAOs/Fifa.js'
import { getGroupCode, getStageCode } from '../utils/traslateNamesToCodes.js';

export const getFixture = async (req, res) => {
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
        else {
            payload.fixture = await Fifa.getAllStages()
        }
        if(payload.fixture.error) throw new Error(payload.fixture.error)
        res.json(payload)
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getGroups = async (req, res) => {
    try {
        const payload = {
            fixture: await Fifa.getAllGroups()
        }
        if(payload.fixture.error) throw new Error(payload.fixture.error)
        res.json(payload)
    }
    catch(err) {
        res.status(500).json({ error: err.message });
    }
}