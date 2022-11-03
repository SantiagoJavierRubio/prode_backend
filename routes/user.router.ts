import { Router } from "express";
import { userController } from "../controllers/user.controller";
import passport from "passport";

export const userRoutes = Router()

userRoutes.use(passport.authenticate("jwt", { session: false }));
userRoutes.get("/profile/:name?", userController.getUserProfile);
userRoutes.post("/edit", userController.editProfile);
userRoutes.get("/avatars", userController.listAvatars);