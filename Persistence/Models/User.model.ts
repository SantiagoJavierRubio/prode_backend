import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: String,
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: String,
  },
  { collection: "users" }
);

export type UserT = mongoose.InferSchemaType<typeof UserSchema>
export type UserDocument = UserT & mongoose.Document;

export const User = mongoose.model("User", UserSchema);
