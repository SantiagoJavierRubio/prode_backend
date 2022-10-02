import { CustomError } from "../../Middleware/Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { GroupT, Group, GroupDocument } from "../Models/Group.model";
import { UserDocument } from "../Models/User.model";
import { LeanDocument } from "mongoose";

interface GroupRules {
  timeLimit: number;
  manifesto: string;
  scoring: {
    NONE: number;
    WINNER: number;
    FULL: number;
  };
}
export interface GroupCreate {
  name: string;
  rules: GroupRules;
}

export class GroupDAO extends Container<GroupDocument> {
  constructor() {
    super(Group);
  }
  async createGroup(
    data: GroupCreate,
    userId: string
  ): Promise<LeanDocument<GroupDocument> | null> {
    const nameExists = await this.getOne({ name: data.name });
    if (nameExists) throw new CustomError(409, "Group name already in use");
    return await this.create({
      name: data.name,
      owner: userId,
      members: [userId],
      rules: data.rules,
    });
  }
}
