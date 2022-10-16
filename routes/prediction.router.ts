import { Router } from "express";
import { predictionController } from "../controllers/prediction.controller";
import passport from "passport";

export const predictionRoutes = Router();

predictionRoutes.use(passport.authenticate("jwt", { session: false }));
predictionRoutes.post("/", predictionController.create);
predictionRoutes.get("/", predictionController.getAll);
predictionRoutes.get("/length", predictionController.getUserPredictionLength);
predictionRoutes.get(
  "/percentage",
  predictionController.getLengthOfUserPredictions
);
predictionRoutes.get("/profile/:id", predictionController.getOtherUsers);
predictionRoutes.put("/:id", predictionController.edit);
predictionRoutes.delete("/:id", predictionController.remove);
predictionRoutes.get("/history", predictionController.getPreviousForStage);
predictionRoutes.get(
  "/random-missing",
  predictionController.getRandomUnpredictedMatch
);
