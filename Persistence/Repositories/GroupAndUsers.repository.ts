import { UserDAO } from "../DAOS/User.dao";
import { GroupDAO } from "../DAOS/Group.dao";
import { GroupDataDTO } from "../../DTOS/Group/group.dto";
import { CustomError } from "../../Middleware/Errors/CustomError";

export class GroupAndUsers {
  users = new UserDAO();
  groups = new GroupDAO();

  async getGroupWithUsers(groupName: string) {
    const group = await this.groups.getOne(
      { name: groupName },
      "name members owner rules"
    );
    if (!group) throw new CustomError(404, "Group not found");
    const members = await this.users.getManyById(group.members, "name avatar");
    if (!members) throw new CustomError(404, "No members found");
    return new GroupDataDTO(group, members);
  }
  async getGroupsWithOwnernames(userId: string) {
    const groups = await this.groups.getGroups(userId);
    // TODO: Implement this functionality
  }
}
