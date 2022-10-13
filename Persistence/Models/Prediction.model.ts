import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
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

export type PredictionT = mongoose.InferSchemaType<typeof PredictionSchema>;
export type PredictionDocument = PredictionT & mongoose.Document;

export const Prediction = mongoose.model("Predictions", PredictionSchema);
