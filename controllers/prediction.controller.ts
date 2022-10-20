import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { Request, Response, NextFunction } from "express";
import { predictionService } from "../services/prediction.service";

class PredictionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.multiple) {
        const predictions = await predictionService.createMultiple(
          req.body,
          req.user?._id
        );
        return res.json(predictions);
      }
      const prediction = await predictionService.createOne(
        req.body.prediction,
        req.user?._id
      );
      res.json(prediction);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const editedId = await predictionService.editPrediction(
        req.params.id,
        req.body,
        req.user?._id
      );
      res.json({ edited: editedId });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await predictionService.fetchAllPredictions(
        req.user?._id,
        req.query.userGroupId?.toString(),
        req.query.stageId?.toString(),
        req.query.groupId?.toString(),
        req.query.own?.toString().toLowerCase() === "true"
      );
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getLengthOfUserPredictionsByStage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payload = await predictionService.fetchUserPredictionLengthByStage(
        req.user?._id,
        req.query.userGroupId?.toString()
      );
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getOtherUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await predictionService.fetchOthersPredictions(
        req.user?._id,
        req.query.userGroupId?.toString(),
        req.params.id
      );
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await predictionService.deletePredictionById(
        req.params.id,
        req.user?._id
      );
      res.sendStatus(200);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  // TO IMPLEMENT IF NEEDED
  // async getPreviousForStage(req: Request, res: Response, next: NextFunction) {
  //   try {
  //   } catch (err) {
  //     errorHandler(err, req, res, next);
  //   }
  // }
  async getRandomUnpredictedMatch(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payload = await predictionService.fetchRandomUnpredictedMatch(
        req.user?._id
      );
      payload ? res.json(payload) : res.sendStatus(204);
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
      const result = await predictionService.fetchUserPredictionCount(
        req.user?._id
      );
      res.json({
        userPredictions: result,
      });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const predictionController = new PredictionController();
