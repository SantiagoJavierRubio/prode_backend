import { UserDAO } from "../Persistence/DAOS/User.dao";
import { Validated } from "./validated.util";
import { UserDocument } from "../Persistence/Models/User.model";
import { LeanDocument } from "mongoose";
import { CustomError } from "../Middleware/Errors/CustomError";
import { UserCreateDTO, UserCreate } from "../DTOS/User/auth.user.dto";
import { generateJwtToken } from "../utils/jwtToken";
import { googleClient } from "../Middleware/Google/google.middleware";
import { VerificationTokenDAO } from "../Persistence/DAOS/VerificationToken.dao";
import { mailer } from "../Middleware/Nodemailer/mailer.middleware";
import __ from "i18next";

interface IUserData {
  user: LeanDocument<UserDocument>;
}

interface IValidatedUser {
  id: string;
  token: string;
}

interface IGoogleToken {
  token: string;
}

export class AuthService extends Validated {
  users = new UserDAO();
  verificationTokens = new VerificationTokenDAO();
  constructor() {
    super();
  }

  async getUser(id: string): Promise<IUserData> {
    const user = await this.users.getById(id, "email name avatar");
    if (!user) throw new CustomError(406, "User not found");
    return { user: user };
  }
  async createWithEmailAndSendVerification(
    input: UserCreate
  ): Promise<IUserData> {
    if (this.hasNulls([input.email, input.name, input.password]))
      throw new CustomError(
        400,
        "Missing fields",
        "Name, email and password are required"
      );
    this.validateUserName(input.name);
    const user = await this.users.createWithEmail(new UserCreateDTO(input));
    if (!user)
      throw new CustomError(500, "Something went wrong while creating user");
    const verificationToken = await this.verificationTokens.generate(user._id);
    if (
      !(await mailer.sendVerificationEmail(
        user._id,
        user.email,
        verificationToken,
        __.language
      ))
    )
      throw new CustomError(500, "Failed to send verification email");
    return { user: user };
  }
  async checkVerification(token: string, userId: string): Promise<boolean> {
    const userToken = await this.verificationTokens.findByUserId(userId);
    if (!userToken) throw new CustomError(404, "Token not found");
    if (userToken.token !== token) throw new CustomError(406, "Invalid token");
    if (Date.now() > userToken.expiration.getTime())
      throw new CustomError(406, "Token expired");
    await this.users.verifyUser(userId);
    if (!(await this.verificationTokens.remove(userToken._id)))
      throw new CustomError(500, "Failed to remove used token");
    return true;
  }
  async checkEmailCredentials(userData: UserCreate): Promise<IValidatedUser> {
    if (this.hasNulls([userData.email, userData.password]))
      throw new CustomError(
        400,
        "Missing fields",
        "Email and password are required"
      );
    const user = await this.users.checkCredentials(
      userData.email,
      `${userData.password}`
    );
    const token = generateJwtToken(user);
    return { id: `${user._id}`, token: token };
  }
  async googleLogin(input: IGoogleToken): Promise<IValidatedUser> {
    if (this.hasNulls([input.token]))
      throw new CustomError(400, "Google token missing");
    const user = await googleClient.checkGoogleUser(input.token);
    return { id: `${user._id}`, token: generateJwtToken(user) };
  }
  async handlePasswordChangeRequest(
    email: string | undefined
  ): Promise<boolean> {
    if (this.hasNulls([email])) throw new CustomError(400, "Email missing");
    const user = await this.users.findByEmail(`${email}`);
    if (!user) throw new CustomError(404, "User not found");
    if (!user.password)
      throw new CustomError(
        406,
        "User registered with Google",
        "Try to sign in with Google"
      );
    const temporaryToken = await this.verificationTokens.generate(
      user._id.toString()
    );
    if (
      !(await mailer.sendPasswordChangeEmail(
        user._id,
        user.email,
        temporaryToken,
        __.language
      ))
    )
      throw new CustomError(500, "Failed to send password change email");
    return true;
  }
  async verifyTemporaryToken(
    token: string | undefined,
    userId: string | undefined
  ): Promise<string> {
    if (!userId || !token)
      throw new CustomError(
        400,
        "Missing fields",
        "User id and token are required"
      );
    const userToken = await this.verificationTokens.findByUserId(userId);
    if (!userToken) throw new CustomError(404, "Token not found");
    if (userToken.token !== token) throw new CustomError(406, "Invalid token");
    if (Date.now() > userToken.expiration.getTime())
      throw new CustomError(406, "Token expired");
    if (!(await this.verificationTokens.remove(userToken._id)))
      throw new CustomError(500, "Failed to remove used token");
    const user = await this.users.getById(userId);
    if (!user) throw new CustomError(404, "User not found");
    return generateJwtToken(user);
  }
  async updatePassword(userId: string, password: string): Promise<boolean> {
    if (this.hasNulls([userId, password]))
      throw new CustomError(400, "User id and password are required");
    return await this.users.changePassword(userId, password);
  }
}

export const authService = new AuthService();
