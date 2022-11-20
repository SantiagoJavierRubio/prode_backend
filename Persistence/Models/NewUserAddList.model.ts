import mongoose from "mongoose";

const UserAddedSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userGroupId: { type: String, required: true },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "added_users" }
);

export type UserAddedT = mongoose.InferSchemaType<typeof UserAddedSchema>;
export type UserAddedDocument = UserAddedT & mongoose.Document;

export const UserAdded = mongoose.model("NewUserAdded", UserAddedSchema);
