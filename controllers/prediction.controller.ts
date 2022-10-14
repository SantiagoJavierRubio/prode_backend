import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { Request, Response, NextFunction } from "express";

class PredictionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async edit(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async editMany(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getLengthOfUserPredictions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getOtherUsers(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getPreviousForStage(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async filterRandomUnpredictedByGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getRandomUnpredictedMatch(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getUserPredictionLength(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const predictionController = new PredictionController();
