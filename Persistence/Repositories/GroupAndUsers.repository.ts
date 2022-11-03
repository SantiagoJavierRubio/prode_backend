import { UserDAO } from "../DAOS/User.dao";
import { GroupDAO } from "../DAOS/Group.dao";
import { GroupDataDTO } from "../../DTOS/Group/group.dto";
import { CustomError } from "../../Middleware/Errors/CustomError";
import mongoose from "mongoose";
import { GroupT } from "../Models/Group.model";

interface GroupWithOwnerName {
  id: string | mongoose.Types.ObjectId;
  name: GroupT["name"];
  members: GroupT["members"];
  owner: string;
  rules: GroupT["rules"];
}

interface OwnerMap {
  [key: string]: string | undefined;
}

export class GroupAndUsers {
  users = new UserDAO();
  groups = new GroupDAO();

  async getGroupWithUsers(groupName: string): Promise<GroupDataDTO> {
    const group = await this.groups.getOne(
      { name: groupName.toUpperCase() },
      "name members owner rules"
    );
    if (!group) throw new CustomError(404, "Group not found");
    const members = await this.users.getManyById(group.members, "name avatar");
    if (!members) throw new CustomError(404, "No members found");
    return new GroupDataDTO(group, members);
  }
  async getGroupsWithOwnernames(userId: string): Promise<GroupWithOwnerName[]> {
    const groups = await this.groups.getGroups(userId);
    if (!groups) throw new CustomError(404, "User has no groups");
    const owners = groups.map((group) => group.owner);
    const ownerNames = await this.users.getManyById(owners, "_id name");
    if (!ownerNames) throw new CustomError(500, "Failed to get owner names");
    const ownersMap: OwnerMap = {};
    owners.forEach((owner) => {
      if (!ownersMap[owner])
        ownersMap[owner] = ownerNames.find(
          (user) => user._id.toString() === owner.toString()
        )?.name;
    });
    return groups.map((group) => {
      return {
        id: group._id.toString(),
        name: group.name,
        members: group.members,
        owner: ownersMap[group.owner] || group.owner,
        rules: group.rules,
      };
    });
  }
}
