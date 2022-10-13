import { Router } from "express";
import passport from "passport";
import { groupController } from "../controllers/group.controller";

export const groupRoutes = Router();

groupRoutes.use(passport.authenticate("jwt", { session: false }));
groupRoutes.get("/", groupController.getGroupData);
groupRoutes.post("/create", groupController.create);
groupRoutes.post("/join", groupController.join);
groupRoutes.post("/leave", groupController.leaveGroup);
groupRoutes.delete("/delete", groupController.deleteGroup);
groupRoutes.get("/rules", groupController.getGroupRules);
groupRoutes.get("/score", groupController.getScores);
