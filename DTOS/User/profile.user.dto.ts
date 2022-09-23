import { LeanDocument } from "mongoose";
import { UserDocument } from "../../Persistence/Models/User.model";

export class UserProfileDTO {
  id: string;
  name: string;
  avatar: string;
  email: string;
  constructor(userData: LeanDocument<UserDocument> | null) {
    if (!userData || userData._id) throw Error("");
    this.id = userData.id || `${userData._id}`;
    this.name = userData.name;
    this.avatar = userData.avatar || '';
    this.email = userData.email;
  }
}
