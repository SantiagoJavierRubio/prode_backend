import { CustomError } from "../../Middleware/Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { UserDocument, User, UserT } from "../Models/User.model";
import { Model, LeanDocument } from "mongoose";
import { genSalt, hash, compare } from "bcryptjs";
import { UserCreateDTO } from "../../DTOS/User/auth.user.dto";

interface UserEdit {
  email?: UserT["email"];
  name?: UserT["name"];
  avatar?: UserT["avatar"];
}

export class UserDAO extends Container<UserDocument> {
  constructor() {
    super(User);
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }
  async findByEmail(email: string): Promise<LeanDocument<UserDocument> | null> {
    return await this.getOne({ email });
  }
  async createWithEmail(
    userData: UserCreateDTO
  ): Promise<LeanDocument<UserDocument> | null> {
    if (!userData.password) throw new CustomError(400, "Password is required");
    const pwd = await this.hashPassword(userData.password);
    if (await this.getOne({ email: userData.email }))
      throw new CustomError(406, "Email already in use");
    if (await this.getOne({ name: userData.name }))
      throw new CustomError(406, "Username already in use");
    return await this.create({...userData, password: pwd });
  }
  async checkCredentials(
    email: string,
    password: string
  ): Promise<LeanDocument<UserDocument>> {
    const user = await this.getOne({ email });
    if (!user) throw new CustomError(404, "User not found");
    if (!user?.password)
      throw new CustomError(
        406,
        "User registered with Google",
        "Try to sign in with Google"
      );
    if (!user.verified) throw new CustomError(401, "User is not verified");
    if (!(await compare(password, user.password)))
      throw new CustomError(401, "Invalid password");
    return user;
  }
  async createWithGoogle(
    email: string
  ): Promise<LeanDocument<UserDocument> | null> {
    return await this.create({
      email: email,
      name: email,
      verified: true,
    });
  }
  async changePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) throw new CustomError(404, "User not found");
    if (!user?.password)
    throw new CustomError(
      406,
      "User registered with Google",
      "Try to sign in with Google"
    );
    const pwd = await this.hashPassword(password);
    await this.update(user?._id, { password: pwd });
    return true;
  }
  async editProfile(userId: string, data: UserEdit): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) throw new CustomError(404, "User not found");
    const exists = await this.getOne({ name: data.name });
    if (exists && exists._id !== userId)
      throw new CustomError(406, "User name already in use");
    await this.update(userId, {
      name: data.name || user.name,
      avatar: data.avatar || user.avatar,
    });
    return true;
  }
}
