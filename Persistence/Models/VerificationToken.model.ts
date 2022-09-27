import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expiration: {
      type: Date,
      default: Date.now() + 1000 * 60 * 60 * 24,
    },
  },
  { collection: "verifications" }
);

export type VerificationTokenT = mongoose.InferSchemaType<
  typeof VerificationSchema
>;
export type VerificationTokenDocument = VerificationTokenT & mongoose.Document;

export const VerificationToken = mongoose.model(
  "VerificationToken",
  VerificationSchema
);
