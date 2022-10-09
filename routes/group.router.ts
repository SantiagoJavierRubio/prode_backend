import { Router } from "express";
import passport from "passport";
import { groupController } from "../controllers/group.controller";

export const groupRoutes = Router();

groupRoutes.use(passport.authenticate("jwt", { session: false }));
groupRoutes.post("/create", groupController.create);
groupRoutes.post("/join", groupController.join);
