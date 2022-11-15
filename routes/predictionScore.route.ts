import { Router } from "express";
import { scorePredictionsController } from "../controllers/predictionsScore.controller";

export const predictionScoreRoutes = Router();

predictionScoreRoutes.post("/", scorePredictionsController.scorePredictions);
