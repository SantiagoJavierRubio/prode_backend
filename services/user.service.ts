import { CustomError } from "../Middleware/Errors/CustomError";
import { UserDAO } from "../Persistence/DAOS/User.dao";
import { UserEditProfile, UserProfileDTO } from "../DTOS/User/profile.user.dto";
import { Validated } from "./validated.util";
import { cloudinary } from "../utils/defaultAvatars";

interface ProfileReturn {
  profile: UserProfileDTO;
  saredGroups?: object[];
}
interface ProfileEditReturn {
  message: string;
  profile: UserProfileDTO;
}
export class UserService extends Validated {
  users = new UserDAO();

  constructor() {
    super();
  }

  async fetchUserProfile(
    name: string | undefined,
    userId: string | undefined
  ): Promise<ProfileReturn> {
    if (this.hasNulls([name, userId]))
      throw new CustomError(
        400,
        "Missing fields",
        "user ID and Username are required"
      );
    const profile = await this.users.getOne({ name: name }, "name avatar");
    if (!profile) throw new CustomError(404, "User not found");
    // const commonGroups = await groups.getCommonGroups(userId, profile.id);
    return {
      profile: new UserProfileDTO(
        profile
      ) /*sharedGroups: commonGroups <-- TODO: IMPLEMENT*/,
    };
  }
  async updateProfileAndReturn(
    userId: string,
    input: UserEditProfile
  ): Promise<ProfileEditReturn> {
    if (this.hasNulls([userId]))
      throw new CustomError(400, "Missing fields", "user ID is required");
    await this.users.editProfile(userId, input);
    const profile = await this.users.getById(userId, "name avatar");
    return { message: "Profile updated", profile: new UserProfileDTO(profile) };
  }
  async fetchAvatars(): Promise<string[]> {
    return await cloudinary.getAvatars();
  }
}


export const userService = new UserService();