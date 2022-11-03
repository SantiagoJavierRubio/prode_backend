import { Response, Request, NextFunction } from "express";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { fifaService } from "../services/fifa.service";

class FifaController {
  // TODO: Add locale management for applying language requests to API
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
      const payload = await fifaService.checkFixtureStatus();
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getNextMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const quantity = parseInt(`${req.query.quantity}`) || 5;
      const response = await fifaService.fetchNextMatches(quantity);
      res.json({ fixture: response });
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const fifaController = new FifaController();
