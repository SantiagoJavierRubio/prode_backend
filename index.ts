import "dotenv/config";
import { App } from "./app";
import { userRoutes } from "./routes/user.router";
import { Middlewares } from "./Middleware/middlewares";
import { Connections } from "./connections";

const PORT = process.env.PORT || 8080;
const ROUTERS = [{ path: "/user", router: userRoutes }];
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