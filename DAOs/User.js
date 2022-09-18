import Container from "../Containers/mongoDB.js";
import Model from "../Models/User.js";
import bcrypt from "bcryptjs";
import CustomError from "../Errors/CustomError.js";
import { hasNulls } from "../utils/dataCheck.js";

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (err) {
    throw new CustomError(500, "Failed to hash password", err.message);
  }
};

const isValidUsername = (name) => {
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
};

class User extends Container {
  constructor() {
    super(Model);
  }
  async findByEmail(email) {
    if (hasNulls([email])) throw new CustomError(400, "Email is required");
    const user = await this.getOne({ email });
    return user;
  }
  async createWithEmail(data) {
    if (hasNulls([data.email, data.password]))
      throw new CustomError(400, "Email and password are required");
    if (data.password.length < 6)
      throw new CustomError(
        400,
        "Password too short",
        "Password must be at least 6 characters"
      );
    isValidUsername(data.name);
    let pwd = await hashPassword(data.password);
    if (await this.getOne({ email: data.email }))
      throw new CustomError(406, "Email already in use");
    if (await this.getOne({ name: data.name }))
      throw new CustomError(406, "User name already in use");
    const user = await this.create({
      ...data,
      password: pwd,
      name: data.name || data.email,
    });
    if (!user)
      throw new CustomError(
        500,
        "Failed to create user",
        "Something went wrong when creating a new user"
      );
    return user;
  }
  async checkCredentials(email, password) {
    if (hasNulls([email, password]))
      throw new CustomError(400, "Email and password are required");
    const user = await this.getOne({ email });
    if (!user) throw new CustomError(404, "User not found");
    if (!user.password)
      throw new CustomError(
        406,
        "User registered with google",
        "Try to sign in with google"
      );
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new CustomError(401, "Invalid password");
    return user;
  }
  async createWithGoogle(data) {
    if (hasNulls([data.email])) throw new CustomError(400, "Email is required");
    const userData = {
      email: data.email,
      name: data.email,
      verified: true,
    };
    const user = await this.create(userData);
    if (!user)
      throw new CustomError(
        500,
        "Failed to create user",
        "Something went wrong when creating a new user"
      );
    return user;
  }
  async changePassword(user_id, password) {
    if (hasNulls([password]))
      throw new CustomError(400, "Password is required");
    const user = await this.getById(user_id);
    if (!user) throw new CustomError(404, "User not found");
    if (!user.password)
      throw new CustomError(
        406,
        "User registered with google",
        "Try to sign in with google"
      );
    if (password.length < 6)
      throw new CustomError(
        400,
        "Password too short",
        "Password must be at least 6 characters"
      );
    let pwd = await hashPassword(password);
    const updated = await this.update(user_id, { password: pwd });
    if (!updated)
      throw new CustomError(
        500,
        "Failed to update user",
        "Something went wrong when updating this user data"
      );
    return true;
  }
  async editProfile(user_id, data) {
    const user = await this.getById(user_id);
    if (!user) throw new CustomError(404, "User not found");
    const exists = await this.getOne({ name: data.name });
    if (exists && exists._id != user_id)
      throw new CustomError(406, "User name already in use");
    isValidUsername(data.name);
    const updated = await this.update(user_id, {
      name: data.name || user.name,
      avatar: data.avatar || user.avatar,
    });
    return updated;
  }
}

const userDAO = new User();
export default userDAO;
