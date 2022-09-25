import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { Request, Response, NextFunction } from "express-serve-static-core";
import { UserDocument } from "../Persistence/Models/User.model";
import { LeanDocument } from "mongoose";
import { userService } from "../Services/user.service";
import { UserEditProfile } from "../DTOS/User/profile.user.dto";

declare global {
  namespace Express {
    interface Request {
      user?: LeanDocument<UserDocument>;
    }
  }
}

export class UserController {
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userName = req.params.name || req.user?.name;
      const response = await userService.fetchUserProfile(userName, req.user?._id)
      res.json(response)
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput = new UserEditProfile(req.body);
        const result = await userService.updateProfileAndReturn(req.user?._id, userInput)
        res.json(result)
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async listAvatars(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.fetchAvatars();
      res.json(result);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}

export const userController = new UserController();
