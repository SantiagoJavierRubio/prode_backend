import mongoose from "mongoose";

interface VerificationToken {
  user_id: string;
  token: string;
  expiration: Date;
}

const VerificationSchema = new mongoose.Schema<VerificationToken>(
  {
    user_id: { type: String, required: true },
    token: { type: String, required: true },
    expiration: {
      type: Date,
      default: Date.now() + 1000 * 60 * 60 * 24,
    },
  },
  { collection: "verifications" }
);

export const VerificationToken = mongoose.model<VerificationToken>(
  "VerificationToken",
  VerificationSchema
);
