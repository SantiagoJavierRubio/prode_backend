import jwt from "jsonwebtoken";
import config from "../config.js";
import { UserDocument } from "../Persistence/Models/User.model.js";
import { LeanDocument } from "mongoose";

export const generateJwtToken = (user: LeanDocument<UserDocument>) => {
  const tokenUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
  };
  const token = jwt.sign(JSON.stringify(tokenUser), `${config.sessionSecret}`);
  return token;
};
