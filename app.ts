import express from "express";
import http from "http";

interface IMiddlewares {
  initialize(app: express.Application): void;
}

interface IConnections {
    createConnections(): void;
}

interface Router {
  path: string;
  router: express.Router;
}

export class App {
  app: express.Application;
  private _server: http.Server = new http.Server();
  constructor(
    public port: string,
    public middlewareManager: IMiddlewares,
    public connectionManager: IConnections,
    public routers: Router[],
    public name?: string
  ) {
    this.app = express();
    this.middlewareManager.initialize(this.app);
    this._initRouters();
    this.connectionManager.createConnections();
  }

  private _initRouters() {
    this.routers.forEach((router) => {
      this.app.use(router.path, router.router);
    });
  }
  start() {
    this._server = this.app.listen(this.port, () => {
      console.log(`${this.name} Server running on port ${this.port}`);
    });
    this._server.on("error", (err) => {
      console.log("Server error: ", err);
      return this.start();
    });
  }
}
