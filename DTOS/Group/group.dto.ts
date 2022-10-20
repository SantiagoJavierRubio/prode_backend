import { UserT, UserDocument } from "../../Persistence/Models/User.model";
import { GroupT, GroupDocument } from "../../Persistence/Models/Group.model";
import { LeanDocument } from "mongoose";

interface GroupMember {
  name: UserT["name"];
  avatar?: UserT["avatar"];
}

export class GroupDataDTO {
  id: string;
  name: string;
  members: GroupMember[];
  owner: GroupMember;
  rules: GroupT["rules"];

  constructor(
    groupData: LeanDocument<GroupDocument>,
    membersData: LeanDocument<UserDocument>[]
  ) {
    this.id = groupData._id.toString();
    this.name = groupData.name;
    this.members = membersData.map((member) => ({
      name: member.name,
      avatar: member.avatar,
    }));
    this.owner = membersData.filter(
      (member) => member._id.toString() === groupData.owner
    )[0];
    this.rules = groupData.rules;
  }
}
