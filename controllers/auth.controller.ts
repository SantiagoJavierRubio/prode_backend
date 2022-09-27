import { Request, Response, NextFunction } from "express";
import { authService } from "../Services/auth.service";
import { errorHandler } from "../Middleware/Errors/errorHandler.middleware";
import { CustomError } from "../Middleware/Errors/CustomError";
import config from "../config";

export class AuthController {
  async getUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.getUser(req.user?._id);
      res.json(response);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async createWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.createWithEmailAndSendVerification(
        req.body
      );
      res.json(response);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token;
      const userId = req.query.user_id;
      if (!token || typeof token !== "string")
        throw new CustomError(400, "Token missing");
      if (!userId || typeof userId !== "string")
        throw new CustomError(400, "User_id missing");
      if (await authService.checkVerification(token, userId))
        res.redirect(`${config.clientUrl}/auth/verified`);
      else
        throw new CustomError(
          500,
          "Something went wrong with your verification"
        );
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async loginWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.checkEmailCredentials(req.body);
      res.json(response);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async googleVerified(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.googleLogin(req.body);
      res.json(response);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.logOut({}, (err) => {
        throw new CustomError(500, err.message, err);
      });
      res.clearCookie("jwt", { path: "/", sameSite: "none", secure: true });
      res.clearCookie("connect.sid", { path: "/" });
      res.sendStatus(200);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async requirePasswordChange(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.handlePasswordChangeRequest(
        req.body.email
      );
      if (response) return res.json({ message: "Email sent" });
      else throw new CustomError(500, "Something went wrong with your request");
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async grantTemporaryVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.query.token;
      const userId = req.query.user_id;
      if (!token || typeof token !== "string")
        throw new CustomError(400, "Token missing");
      if (!userId || typeof userId !== "string")
        throw new CustomError(400, "User_id missing");
      const jwt = await authService.verifyTemporaryToken(token, userId);
      res.redirect(`${config.clientUrl}/auth/change-password/${jwt}`);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const password = req.body.password;
      if (!password || typeof password !== "string")
        throw new CustomError(400, "Password missing");
      if (!(await authService.updatePassword(req.user?._id, password)))
        throw new CustomError(
          500,
          "Something went wrong when changing passwords"
        );
      req.logOut({}, (err) => {
        throw new CustomError(500, err.message, err);
      });
      res.clearCookie("jwt", { path: "/", sameSite: "none", secure: true });
      res.clearCookie("connect.sid", { path: "/" });
      res.sendStatus(200);
    } catch (err) {
      errorHandler(err, req, res, next);
    }
  }
}
