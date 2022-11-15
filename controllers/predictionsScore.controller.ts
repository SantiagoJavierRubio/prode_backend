import { Request, Response, NextFunction } from "express";
import path from "path";
import { fork } from "child_process";
import config from "../config";

class PredictionsScoreController {
  async scorePredictions(req: Request, res: Response, next: NextFunction) {
    try {
      if (`${req.headers.authorization}` === `${config.scoringPassword}`) {
        fork(path.join(process.cwd(), "dist", "utils/scorePredictions.js"));
        res.send("server received scoring command");
      } else {
        res.send("incorrect password");
      }
    } catch (err) {
      next();
    }
  }
}

export const scorePredictionsController = new PredictionsScoreController();

//"utils/scorePredictions.js"
