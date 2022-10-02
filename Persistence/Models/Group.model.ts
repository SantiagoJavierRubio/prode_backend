import mongoose from "mongoose";

interface UserGroupRules {
  manifesto: string;
  scoring: {
    NONE: number;
    WINNER: number;
    NULL: number;
  };
  timeLimit: number;
}

export type GroupT = {
  name: string;
  owner: string;
  members: string[];
  rules: UserGroupRules | undefined;
};

interface IUserGroupMethods {
  addMember(id: string): string[];
}

type UserGroupModel = mongoose.Model<GroupT, {}, IUserGroupMethods>;

const GroupSchema = new mongoose.Schema<
  GroupT,
  UserGroupModel,
  IUserGroupMethods
>(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    members: [String],
    rules: {
      type: Object,
      required: true,
      default: {
        manifesto: "",
        scoring: {
          NONE: 0,
          WINNER: 1,
          FULL: 3,
        },
        timeLimit: 0,
      },
    },
  },
  { collection: "groups" }
);

GroupSchema.method("addMember", function (id: string): string[] {
  this.members.push(id);
  return this.members;
});

export type GroupDocument = GroupT & mongoose.Document;

export const Group = mongoose.model("Group", GroupSchema);
