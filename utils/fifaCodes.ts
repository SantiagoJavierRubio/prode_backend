import { FifaDAO } from "../Persistence/DAOS/Fifa.dao";
import "dotenv/config";

interface Codes {
  [name: string]: string;
}

class FifaCodes {
  private fifa: FifaDAO;
  private _STAGE_CODES: Codes = {};
  private _GROUP_CODES: Codes = {};

  constructor(actual: boolean) {
    this.fifa = new FifaDAO(actual);
    this._getGroupCodes();
    this._getStageCodes();
  }

  private async _getStageCodes() {
    const stages = await this.fifa.getAllStages("en");
    stages.forEach((stage) => {
      if (stage.groups) this._STAGE_CODES.GRUPOS = stage.id;
      else
        switch (stage.matches?.length) {
          case 8:
            this._STAGE_CODES.OCTAVOS = stage.id;
            break;
          case 4:
            this._STAGE_CODES.CUARTOS = stage.id;
            break;
          case 2:
            this._STAGE_CODES.SEMIFINAL = stage.id;
            break;
          case 1:
          default:
            if (stage.name.toLowerCase().includes("final"))
              this._STAGE_CODES.FINAL = stage.id;
            else this._STAGE_CODES.TERCER_PUESTO = stage.id;
        }
    });
  }
  private async _getGroupCodes() {
    const stages = await this.fifa.getAllStages("en");
    const groupStage = stages.filter((stage) => stage.groups)[0];
    groupStage.groups?.forEach((group) => {
      const name = group.name.slice(-1);
      this._GROUP_CODES[name] = group.id;
    });
  }

  getGroupCode(input: string): string {
    const i = input.toUpperCase();
    if (this._GROUP_CODES[i]) return this._GROUP_CODES[i];
    return input;
  }
  getStageCode(input: string): string {
    const i = input.toUpperCase();
    if (this._STAGE_CODES[i]) return this._STAGE_CODES[i];
    return input;
  }
}

export const fifaCodes = new FifaCodes(!(process.env.MODO_PRUEBA === "RUSIA"));
