import { Container } from "../Containers/Mongo.container";
import {
  UserAdded,
  UserAddedT,
  UserAddedDocument,
} from "../Models/NewUserAddList.model";
import { CustomError } from "../../Middleware/Errors/CustomError";

export class UserAddedDAO extends Container<UserAddedDocument> {
  constructor() {
    super(UserAdded);
  }
  async registerUserJoined(userId: string, userGroupId: string) {
    const exists = await this.getOne({ userId, userGroupId });
    if (!exists) this.create({ userId, userGroupId });
  }
  async getDateJoined(
    userId: string,
    userGroupId: string
  ): Promise<Date | null> {
    const reg = await this.getOne({ userId, userGroupId });
    if (reg) return new Date(reg.timestamp);
    return null;
  }
}
