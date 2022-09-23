import { UserDAO } from "../Persistence/DAOS/User.dao";
import { CustomError } from "../Errors/CustomError";
import { errorHandler } from "../Errors/errorHandler";
import { Request, Response, NextFunction } from "express-serve-static-core";
import { UserDocument } from "../Persistence/Models/User.model";
import { LeanDocument } from "mongoose";
import { UserService } from "../services/user.service";
import { UserEditProfile } from "../DTOS/User/profile.user.dto";

declare global {
  namespace Express {
    interface Request {
      user?: LeanDocument<UserDocument>;
    }
  }
}

export class UserController {
  users = new UserDAO();
  service = new UserService();

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userName = req.params.name || req.user?.name;
      const response = await this.service.fetchUserProfile(userName, req.user?.id)
      res.json(response)
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userInput = new UserEditProfile(req.body);
        await this.service.updateProfileAndReturn(req.user?.id, userInput)
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async listAvatars(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}
