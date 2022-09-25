import config from "./config";
import mongoose, { ConnectOptions } from "mongoose";

export class Connections {

    MONGO_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
    createConnections() {
        mongoose.connect(`${config.mongoUrl}`, this.MONGO_OPTIONS as ConnectOptions, (err) => {
            if (err) {
                console.error("Failed to connect to mongoDB", err);
              } else {
                console.log("Connected to mongoDB");
              }
        })
    }
}