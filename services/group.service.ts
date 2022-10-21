import { Validated } from "./validated.util";
import { CustomError } from "../Middleware/Errors/CustomError";
import { GroupDAO, GroupCreate } from "../Persistence/DAOS/Group.dao";
import { GroupAndUsers } from "../Persistence/Repositories/GroupAndUsers.repository";
import { Scores } from "../Persistence/Repositories/Scores.repository";
import { PredictionDAO } from "../Persistence/DAOS/Prediction.dao";

class GroupService extends Validated {
  groups = new GroupDAO();
  groupsAndUsers = new GroupAndUsers();
  scores = new Scores();
  predictions = new PredictionDAO();

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
      data.rules?.timeLimit &&
      !this.arePositiveNumbers([data.rules?.timeLimit])
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
    await this.predictions.removeManyByUser(userId, {
      userGroupId: groupId,
    });
    return groupId;
  }
  async fetchGroupData(groupName: string | undefined, userId: string) {
    if (groupName) {
      const groupData = await this.groupsAndUsers.getGroupWithUsers(groupName);
      return { groupData };
    }
    if (!userId)
      throw new CustomError(400, "Missing data", "Group name or user required");
    return this.groupsAndUsers.getGroupsWithOwnernames(userId);
  }
  async removeGroup(groupId: string | undefined, userId: string) {
    if (!groupId || !userId || this.hasNulls([groupId, userId]))
      throw new CustomError(
        400,
        "Missing field",
        "Group id and user are required"
      );
    return this.groups.deleteGroup(groupId, userId);
  }
  async fetchGroupRules(groupName: string | undefined) {
    if (!groupName)
      throw new CustomError(400, "Missing data", "Group name required");
    const groupData = await this.groups.getOne(
      { name: groupName.toUpperCase() },
      "rules"
    );
    if (!groupData) throw new CustomError(404, "Group not found");
    return groupData.rules;
  }
  async fetchGroupDataWithScores(
    userId: string,
    groupName: string | undefined
  ) {
    if (!userId || !groupName) throw new CustomError(400, "Missing data");
    const groupData = await this.groups.getOne({
      name: groupName.toUpperCase(),
    });
    if (!groupData) throw new CustomError(404, "Group not found");
    if (!(await this.groups.checkForUserInGroup(groupData?._id, userId)))
      throw new CustomError(401, "User not in gorup");
    const data = await this.scores.getScoresByUser(groupData);
    return {
      group: {
        name: groupData.name,
        owner: data.owner?.name,
      },
      scores: data.scores,
    };
  }
}

export const groupService = new GroupService();
