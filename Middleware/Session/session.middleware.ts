import { default as _session } from "express-session";
import config from "../../config";
import { mongoStore } from "./sessionStore.middleware";

export const session = _session({
  store: mongoStore,
  secret: `${config.sessionSecret}`,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
