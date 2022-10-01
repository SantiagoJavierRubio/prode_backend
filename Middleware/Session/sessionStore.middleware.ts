import MongoStore from "connect-mongo";
import { MongoClientOptions } from "mongodb";
import config from "../../config";

export const mongoStore = MongoStore.create({
  mongoUrl: config.mongoUrl,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as MongoClientOptions,
});
