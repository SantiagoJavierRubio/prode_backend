import { Router } from "express";
import { predictionController } from "../controllers/prediction.controller";
import passport from "passport";

export const predictionRoutes = Router();

predictionRoutes.use(passport.authenticate("jwt", { session: false }));
predictionRoutes.post("/");
predictionRoutes.get("/");
predictionRoutes.get("/length");
predictionRoutes.get("/percentage");
predictionRoutes.get("/profile/:id");
predictionRoutes.put("/:id");
predictionRoutes.post("/edit-multiple");
predictionRoutes.delete("/:id");
predictionRoutes.get("/history");
predictionRoutes.get("/random-missing");
