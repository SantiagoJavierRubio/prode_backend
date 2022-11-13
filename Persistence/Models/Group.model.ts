import mongoose from "mongoose";

export interface UserGroupRules {
  manifesto: string;
  scoring: {
    NONE: number;
    WINNER: number;
    NULL: number;
  };
  timeLimit: number;
  limitByPhase: boolean;
}

export interface ExtraPredictionsCategory {
  key: string;
  description: string;
  timeLimit: Date;
  score: number;
}

export type GroupT = {
  name: string;
  owner: string;
  members: string[];
  extraPredictions?: ExtraPredictionsCategory[];
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
    extraPredictions: { type: [Object], required: false },
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
        limitByPhase: false,
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
