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

export interface UserGroup {
  name: string;
  owner: string;
  members: string[];
  rules: UserGroupRules | undefined;
}

const GroupSchema = new mongoose.Schema<UserGroup>(
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

GroupSchema.methods.addMember = function (id: string): string[] {
  this.members.push(id);
  return this.members;
};

export const Group = mongoose.model<UserGroup>("Group", GroupSchema);
