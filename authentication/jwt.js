import jwt from "jsonwebtoken";
import config from "../config.js";

export const generateJwtToken = (user) => {
  const token = jwt.sign(user.toJSON(), config.sessionSecret, {
    expiresIn: "30d",
  });
  return token;
};
