import "dotenv/config";
import { App } from "./app";
import { userRoutes } from "./routes/user.router";
import { authRoutes } from "./routes/auth.router";
import { fifaRoutes } from "./routes/fifa.router";
import { groupRoutes } from "./routes/group.router";
import { predictionRoutes } from "./routes/prediction.router";
import { Middlewares } from "./Middleware/middlewares";
import { Connections } from "./connections";

const PORT = process.env.PORT || 8080;
const ROUTERS = [
  { path: "/user", router: userRoutes },
  { path: "/auth", router: authRoutes },
  { path: "/fifa", router: fifaRoutes },
  { path: "/group", router: groupRoutes },
  { path: "/predictions", router: predictionRoutes },
];
const middlewareManager = new Middlewares();
const connectionManager = new Connections();

const app = new App(
  PORT.toString(),
  middlewareManager,
  connectionManager,
  ROUTERS,
  "Chumbazo prode"
);

app.start();
