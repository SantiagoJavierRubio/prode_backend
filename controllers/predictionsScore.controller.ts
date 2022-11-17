import { Request, Response, NextFunction } from "express";
import scorePredictions from "../utils/scorePredictions";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import config from "../config";

class PredictionsScoreController {
  async scorePredictions(req: Request, res: Response, next: NextFunction) {
    try {
      if (`${req.headers.authorization}` === `${config.scoringPassword}`) {
        const response = await scorePredictions();
        res.send(response);
      } else {
        res.send("incorrect password");
      }
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const scorePredictionsController = new PredictionsScoreController();
