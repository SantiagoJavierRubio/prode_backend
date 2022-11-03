import { Router } from "express";
import passport from "passport";
import { authController } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  authController.getUserData
);
authRoutes.post("/email", authController.loginWithEmail);
authRoutes.post("/email/create", authController.createWithEmail);
authRoutes.get("/email/verify", authController.verifyEmail);
authRoutes.post("/google", authController.googleVerified);
authRoutes.post("/new-password", authController.requirePasswordChange);
authRoutes.get("/change-password", authController.grantTemporaryVerification);
authRoutes.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  authController.changePassword
);
authRoutes.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  authController.logout
);
