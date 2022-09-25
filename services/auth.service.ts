import { UserDAO } from "../Persistence/DAOS/User.dao";
import { Validated } from "./validated.util";
import { UserDocument } from "../Persistence/Models/User.model";
import { LeanDocument } from "mongoose";
import { CustomError } from "../Middleware/Errors/CustomError";
import { UserCreateDTO, UserCreate } from "../DTOS/User/auth.user.dto";
import { generateJwtToken } from "../utils/jwtToken";
import { googleClient } from "../Middleware/Google/googleVerification";

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
    const user = await this.users.createWithEmail(new UserCreateDTO(input));
    if (!user)
      throw new CustomError(500, "Something went wrong while creating user");
    // TODO: Implement sendVerificationEmail
    return { user: user };
  }
  async checkVerification(token: string, userId: string): Promise<boolean> {
    // TODO: Implement
    return false;
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
    // TODO: -> await sendPasswordChaingEmail(user)
    return true;
  }
}

export const authService = new AuthService();
