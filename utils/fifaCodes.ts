import { FifaDAO } from "../Persistence/DAOS/Fifa.dao";
import { Stage } from "../Persistence/DAOS/Fifa.dao";
import { CustomError } from "../Middleware/Errors/CustomError";
import "dotenv/config";

interface Codes {
  [name: string]: string;
}

class FifaCodes {
  private fifa: FifaDAO;
  private _STAGE_CODES: Codes = {};
  private _GROUP_CODES: Codes = {};

  constructor(actual: boolean) {
    this.fifa = new FifaDAO();
    this._getCodes();
  }

  private async _getCodes(): Promise<void> {
    const stages = await this.fifa.getAllStages("en");
    await this._getGroupCodes(stages);
    await this._getStageCodes(stages);
  }

  private async _getStageCodes(stages: Stage[]): Promise<void> {
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
  private async _getGroupCodes(stages: Stage[]): Promise<void> {
    const groupStage = stages.filter((stage) => stage.groups)[0];
    groupStage.groups?.forEach((group) => {
      const name = group.name.slice(-1);
      this._GROUP_CODES[name] = group.id;
    });
  }

  getGroupCode(input: string): string {
    if (!input) throw new CustomError(400, "Missing code");
    const i = input.toUpperCase();
    if (this._GROUP_CODES[i]) return this._GROUP_CODES[i];
    return input;
  }
  getStageCode(input: string): string {
    if (!input) throw new CustomError(400, "Missing code");
    const i = input.toUpperCase();
    if (this._STAGE_CODES[i]) return this._STAGE_CODES[i];
    return input;
  }
  getStageName(code: string): string {
    if (!code) throw new CustomError(400, "Missing code");
    for (let [key, value] of Object.entries(this._STAGE_CODES)) {
      if (value === code) return key;
    }
    return code;
  }
}

export const fifaCodes = new FifaCodes(!(process.env.MODO_PRUEBA === "RUSIA"));
