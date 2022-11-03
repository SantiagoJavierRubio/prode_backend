import { CustomError } from "../../Middleware/Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { GroupT, Group, GroupDocument } from "../Models/Group.model";
import { LeanDocument } from "mongoose";

export interface GroupCreate {
  name: GroupT["name"];
  rules: GroupT["rules"];
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
  async getGroups(
    userId: string
  ): Promise<LeanDocument<GroupDocument>[] | null> {
    return await this.getMany({ members: userId }, "members name owner rules");
  }
  async getCommonGroups(
    userId: string,
    otherId: string
  ): Promise<LeanDocument<GroupDocument>[] | null> {
    return await this.getMany(
      {
        members: { $all: [userId, otherId] },
      },
      "name"
    );
  }
  async checkForUserInGroup(groupId: string, userId: string): Promise<boolean> {
    const group = await this.getById(groupId, "members");
    if (!group) throw new CustomError(404, "Group not found");
    return group.members.includes(userId);
  }
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.getById(groupId);
    if (!group) throw new CustomError(404, "Group not found");
    if (!group.members.includes(userId))
      throw new CustomError(401, "User not in group");
    if (group.owner !== userId)
      throw new CustomError(401, "You have no permission to delete this group");
    if (group.members.length > 1)
      throw new CustomError(
        403,
        "Cannot delete group with other members in it"
      );
    await this.delete(groupId);
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
  async getMembers(groupName: string): Promise<string[]> {
    const group = await this.getOne({ name: groupName });
    if (!group) throw new CustomError(404, "Group not found");
    return group.members;
  }
  async removeMember(
    groupName: string,
    userId: string
  ): Promise<string | null> {
    const group = await this.getOne({ name: groupName });
    if (!group) throw new CustomError(404, "Group not found");
    if (!group.members.includes(userId))
      throw new CustomError(404, "User not in group");
    if (group.owner === userId) {
      if (group.members.length === 1)
        throw new CustomError(406, "Cannot remove admin from group", group._id);
      await this.update(group._id, {
        owner: group.members.filter((member) => member !== userId)[0],
        $pull: { members: userId },
      });
    } else {
      await this.update(group._id, {
        $pull: { members: userId },
      });
    }
    return group._id;
  }
  async edit(
    groupId: string,
    groupData: GroupCreate,
    userId: string
  ): Promise<void> {
    const exists = await this.getById(groupId);
    if (!exists) throw new CustomError(404, "Group not found");
    if (exists.owner !== userId)
      throw new CustomError(401, "You are not authorized to edit this group");
    const nameExists = await this.getOne({ name: groupData.name });
    if (nameExists && nameExists._id.toString() !== groupId)
      throw new CustomError(409, "Group name already in use");
    return this.update(groupId, groupData);
  }
}
