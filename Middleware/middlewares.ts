import express from "express";
import config from "../config";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";
import passport from "passport";
import { session } from "./Session/session.middleware";
import { errorHandler } from "./Errors/errorHandler.middleware";
import "./Passport/passportStrategies.middleware";
import "dotenv/config";

export class Middlewares {
  corsOptions: CorsOptions = {
    credentials: true,
    origin: [config.clientUrl, "https://prodetest.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  initialize(app: express.Application): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(process.cwd() + "/public"));
    app.set("trust proxy", 1);
    app.use(cors(this.corsOptions));
    app.use(helmet());
    app.use(session);
    app.use(passport.initialize());
    app.use(errorHandler);
  }
}
