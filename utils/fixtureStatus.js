import FifaRepository from "../DAOs/Repositories/FifaRepository.js";
import { getStageCode } from "../utils/traslateNamesToCodes.js";

const fifa = new FifaRepository();

export const checkFixtureStatus = async () => {
  const matches = await fifa.getAllMatches();
  const activeStages = [];
  for (let match of matches) {
    if (activeStages.includes(match.stageId)) continue;
    if (match.home.name || match.away.name) activeStages.push(match.stageId);
  }
  const payload = {
    GRUPOS: false,
    OCTAVOS: false,
    CUARTOS: false,
    SEMIFINAL: false,
    FINAL: false,
    TERCER_PUESTO: false,
  };
  for (let name of Object.keys(payload)) {
    if (activeStages.includes(getStageCode(name))) payload[name] = true;
  }
  return payload;
};
