import jwt from "jsonwebtoken";
import config from "../config.js";
import { UserDocument } from "../Persistence/Models/User.model.js";
import { LeanDocument } from "mongoose";


export const generateJwtToken = (user: LeanDocument<UserDocument>) => {
  const token = jwt.sign(JSON.stringify(user), `${config.sessionSecret}`, {
    expiresIn: "30d",
  });
  return token;
};
