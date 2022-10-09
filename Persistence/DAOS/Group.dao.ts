import { CustomError } from "../../Middleware/Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { GroupT, Group, GroupDocument } from "../Models/Group.model";
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
  async addMember(
    groupName: string,
    userId: string
  ): Promise<LeanDocument<GroupDocument> | null> {
    const group = await this.getOne({ name: groupName });
    if (!group) throw new CustomError(409, "Group not found");
    if (group.members.includes(userId))
      throw new CustomError(409, "User already in group");
    await this.update(group._id, { members: [...group.members, userId] });
    return await this.getById(group._id);
  }
}
