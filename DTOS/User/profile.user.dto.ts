import { LeanDocument } from "mongoose";
import { UserDocument } from "../../Persistence/Models/User.model";
import { UserT } from "../../Persistence/Models/User.model";

export class UserProfileDTO {
  id: string;
  name: UserT["name"];
  avatar: UserT["avatar"];
  email: UserT["email"];
  constructor(userData: LeanDocument<UserDocument> | null) {
    if (!userData || userData._id) throw Error("");
    this.id = userData.id || `${userData._id}`;
    this.name = userData.name;
    this.avatar = userData.avatar || '';
    this.email = userData.email;
  }
}

interface UserProfileInput {
  name?: UserT["name"];
  avatar?: UserT["avatar"];
}

export class UserEditProfile {
  name?: UserT["name"];
  avatar?: UserT["avatar"];
  constructor(userData: UserProfileInput) {
    this.name = userData?.name;
    this.avatar = userData?.avatar;
  }
}
