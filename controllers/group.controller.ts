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
  async XXXX(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const groupController = new GroupController();
