import mongoose from "mongoose";

interface Prediction {
  matchId: string;
  userId: string;
  userGroupId: string;
  homeScore: number;
  awayScore: number;
  edited: Date;
  checked: boolean;
  score: number;
}

const predictionSchema = new mongoose.Schema<Prediction>(
  {
    matchId: { type: String, required: true },
    userId: { type: String, required: true },
    userGroupId: { type: String, required: true },
    homeScore: { type: Number, required: true },
    awayScore: { type: Number, required: true },
    edited: {
      type: Date,
      default: Date.now(),
    },
    checked: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { collection: "predictions" }
);

export const Prediction = mongoose.model<Prediction>("Predictions", predictionSchema);
