import { CustomError } from "../../Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { UserDocument, User, UserT } from "../Models/User.model";
import { Model, LeanDocument } from "mongoose";
import { genSalt, hash } from "bcryptjs"

interface UserCreate {
  email: UserT["email"];
  password: UserT["password"];
  name: UserT["name"];
}

interface UserEdit {
  email?: UserT["email"];
  name?: UserT["name"];
  avatar?: UserT["avatar"];
}

export class UserDAO extends Container<UserDocument> {
  constructor() {
    super(new Model(User));
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt)
  }
  validateUsername(name: string): void {
    if (name.length > 20) {
      throw new CustomError(
        400,
        "Username too long",
        "Usernames should be 20 characters or less"
      );
    }
    if (/([^A-Za-z0-9])/.test(name)) {
      throw new CustomError(
        400,
        "Invalid username",
        "Only alphanumeric characters allowed"
      );
    }
  }
  async findByEmail(email: string): Promise<LeanDocument<UserDocument> | null> {
    return await this.getOne({ email });
  }
  async createWithEmail(userData: UserCreate): Promise<LeanDocument<UserDocument> | null> {
    return await this.create(userData);
  }
  async checkCredentials(
    email: string,
    password: string
  ): Promise<LeanDocument<UserDocument> | null> {
    const user = await this.getOne({ email });
    return user;
  }
  async createWithGoogle(email: string): Promise<LeanDocument<UserDocument> | null> {
    const user = await this.create({
      email: email,
      name: email,
      verified: true,
    });
    return user;
  }
  async changePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId);
    const updated = await this.update(user?._id, { password: password });
    return true;
  }
  async editProfile(userId: string, data: UserEdit): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) throw new CustomError(404, "User not found");
    const exists = await this.getOne({ name: data.name });
    if (exists && exists._id !== userId)
      throw new CustomError(406, "User name already in use");
    const updated = await this.update(userId, {
        name: data.name || user.name,
        avatar: data.avatar || user.avatar
    });
    return true;
  }
}
