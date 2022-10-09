import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { CustomError } from "../Middleware/Errors/CustomError";
import { groupService } from "../services/group.service";

class GroupController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userInput = req.body;
      const payload = await groupService.validateCreateReturn(
        userInput,
        req.user?._id
      );
      res.status(201).json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const groupName = req.query.groupName?.toString().toUpperCase();
      const user = req.user;
      const payload = await groupService.joinGroup(groupName, user?._id);
      res.json(payload);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getGroupRules(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getScores(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async leaveGroup(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async getGroupData(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const groupController = new GroupController();
