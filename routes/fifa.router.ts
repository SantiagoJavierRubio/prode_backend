import { Router } from "express";
import { fifaController } from "../controllers/fifa.controller";

export const fifaRoutes = Router();

// TODO implementar => router.use(getLocaleLanguage);
fifaRoutes.get("/", (req, res) => {
  res.send("Welcome to the API!");
});
fifaRoutes.get("/fixture", fifaController.getFixture);
fifaRoutes.get("/fixture/groups", fifaController.getGroups);
fifaRoutes.get("/fixture-status", fifaController.getFixtureStatus);
fifaRoutes.get("/next-matches", fifaController.getNextMatches);
fifaRoutes.get("/live", fifaController.getLiveMatch);
