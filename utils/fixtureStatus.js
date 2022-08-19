import FifaRepository from "../DAOs/Repositories/FifaRepository.js";
import { getStageCode } from "../utils/traslateNamesToCodes.js";

const fifa = new FifaRepository();

const STAGE_NAMES = ["GRUPOS", "OCTAVOS", "CUARTOS", "SEMIFINAL", "FINAL", "TERCER_PUESTO"];

const getStagesFixture = async () => {
    const stagesFixtures = {};
    for (const stage of STAGE_NAMES) {
        stagesFixtures[stage] = await fifa.getOneStage(getStageCode(stage));
    }
    return stagesFixtures;
}

const checkIfStageIsActive = (stage) => {
    let result = false;
    let i = 0;
    while(!result && i < stage.length) {
        if(typeof stage[i].home === "object" || typeof stage[i].away === "object") {
            result = true;
        }
        i++;
    }
    return result;
}

export const retrieveFixtureStatus = async () => {
    const fixture = await getStagesFixture();
    const payload = {
        GRUPOS: false,
        OCTAVOS: false,
        CUARTOS: false,
        SEMIFINAL: false,
        FINAL: false,
        TERCER_PUESTO: false
    };
    for (let stage of STAGE_NAMES) {
        if (checkIfStageIsActive(fixture[stage])) {
            payload[stage] = true;
        } else {
            break;
        }
    }
    return payload;
}