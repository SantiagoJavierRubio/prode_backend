import { OAuth2Client } from "google-auth-library";
import { UserDAO } from "../../Persistence/DAOS/User.dao";
import config from "../../config";
import { LeanDocument } from "mongoose";
import { UserDocument } from "../../Persistence/Models/User.model";

class Google {
  private _client = new OAuth2Client(config.googleClientId);
  users = new UserDAO();

  private async _verify(token: string) {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: token,
        audience: config.googleClientId,
      });
      return ticket.getPayload();
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async checkGoogleUser(token: string): Promise<LeanDocument<UserDocument>> {
    const verifiedUser = await this._verify(token);
    if (!verifiedUser || !verifiedUser.email)
      throw new Error("Google verification failed");
    const user = await this.users.findByEmail(verifiedUser.email);
    if (user) return user;
    const newUser = await this.users.createWithGoogle(verifiedUser.email);
    if (newUser) return newUser;
    throw new Error("Failed to create user with Google");
  }
}

export const googleClient = new Google();
