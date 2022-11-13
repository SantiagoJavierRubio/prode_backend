import { UserT, UserDocument } from "../../Persistence/Models/User.model";
import { GroupT, GroupDocument } from "../../Persistence/Models/Group.model";
import { LeanDocument } from "mongoose";
import { ExtraPredictionsCategoryDTO } from "../ExtraPredictions/ExtraPredictionsCategory.dto";

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
  extraPredictions: GroupT["extraPredictions"];

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
    this.extraPredictions = groupData.extraPredictions
      ? groupData.extraPredictions.map(
          (ep) => new ExtraPredictionsCategoryDTO(ep)
        )
      : undefined;
  }
}
