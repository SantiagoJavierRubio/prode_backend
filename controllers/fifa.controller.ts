import { Response, Request, NextFunction } from "express";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { fifaService } from "../Services/fifa.service";

class FifaController {
  async getFixture(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = req.query.groupId ? `${req.query.groupId}` : null;
      const stageId = req.query.stageId ? `${req.query.stageId}` : null;
      const response = await fifaService.fetchFixture(groupId, stageId);
      res.json({ fixture: response });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await fifaService.fetchGroups();
      res.json({ fixture: response });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getFixtureStatus(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getNextMatches(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const fifaController = new FifaController();
