import { CustomError } from "../Errors/CustomError";
import { UserDAO } from "../Persistence/DAOS/User.dao";
import { UserProfileDTO } from "../DTOS/User/profile.user.dto";

interface ProfileData {
    profile: UserProfileDTO,
    saredGroups?: object[]
}

export class UserService {
    users = new UserDAO();

    async fetchUserProfile(name: string | undefined): Promise<ProfileData> {
        if (!name) throw new CustomError(400, "Username is required")
        const profile = await this.users.getOne({ name: name }, "name avatar")
        if (!profile) throw new CustomError(404, "User not found");
        return({ profile: new UserProfileDTO(profile) })
    }
}