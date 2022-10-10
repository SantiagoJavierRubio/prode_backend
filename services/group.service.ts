import { Validated } from "./validated.util";
import { CustomError } from "../Middleware/Errors/CustomError";
import { GroupDAO, GroupCreate } from "../Persistence/DAOS/Group.dao";

class GroupService extends Validated {
  groups = new GroupDAO();
  constructor() {
    super();
  }
  async validateCreateReturn(data: GroupCreate, userId: string) {
    data.name = data.name?.trim().toUpperCase();
    if (this.hasNulls([data.name, userId]))
      throw new CustomError(400, "Missing data");
    if (data.name.length > 20)
      throw new CustomError(
        400,
        "Group name is too long",
        "Group name must be less than 21 characters"
      );
    if (!/[a-zA-Z0-9]/.test(data.name))
      throw new CustomError(
        400,
        "Group name not valid",
        "Group name must contain at least one letter or number"
      );
    if (
      data.rules.timeLimit &&
      !this.arePositiveNumbers([data.rules.timeLimit])
    )
      throw new CustomError(
        400,
        "Time prediction limit must be a positive number"
      );
    return this.groups.createGroup(data, userId);
  }
  async joinGroup(groupName: string | undefined, userId: string) {
    if (!groupName || !userId || this.hasNulls([groupName, userId]))
      throw new CustomError(
        400,
        "Missing field",
        "Group name and user are required"
      );
    return this.groups.addMember(groupName.toUpperCase(), userId);
  }
  async removeFromGroup(groupName: string | undefined, userId: string) {
    if (!groupName || !userId || this.hasNulls([groupName, userId]))
      throw new CustomError(
        400,
        "Missing field",
        "Group name and user are required"
      );
    const groupId = await this.groups.removeMember(
      groupName.toUpperCase(),
      userId
    );
    if (!groupId)
      throw new CustomError(500, "Failed to remove user from group");
    // TODO: implement remove predictions by this user
    return groupId;
  }
  async fetchGroupData(groupName: string | undefined) {}
  async removeGroup(groupId: string | undefined, userId: string) {}
}

export const groupService = new GroupService();
