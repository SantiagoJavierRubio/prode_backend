import jwt from "jsonwebtoken";
import config from "../config.js";


export const generateJwtToken = (user: string) => {
  const token = jwt.sign(JSON.stringify(user), `${config.sessionSecret}`, {
    expiresIn: "30d",
  });
  return token;
};
