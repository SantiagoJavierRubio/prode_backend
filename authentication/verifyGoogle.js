import { OAuth2Client } from "google-auth-library";
import User from "../DAOs/User.js";
import config from "../config.js";

const client = new OAuth2Client(config.googleClientId);

const verify = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });
    return ticket.getPayload();
  } catch (err) {
    console.log(err);
    return null;
  }
};
const checkGoogleUser = async (token) => {
  try {
    const verifiedUser = await verify(token);
    if (!verifiedUser) throw new Error("Google verification failed");
    const user = await User.findByEmail(verifiedUser.email);
    if (user) {
      return user;
    } else {
      const newUser = await User.createWithGoogle(verifiedUser);
      if (newUser) return newUser;
      throw new Error("Failed to create user");
    }
  } catch (err) {
    return { error: err.message };
  }
};

export default checkGoogleUser;
