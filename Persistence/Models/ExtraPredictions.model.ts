import mongoose from "mongoose";

const ExtraPredictionsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userGroupId: { type: String, required: true },
    predictions: { type: Map, of: String, required: true },
    edited: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "extra_predictions" }
);

export type ExtraPredictionsT = mongoose.InferSchemaType<
  typeof ExtraPredictionsSchema
>;
export type ExtraPredictionsDocument = ExtraPredictionsT & mongoose.Document;

export const ExtraPrediction = mongoose.model(
  "ExtraPredictions",
  ExtraPredictionsSchema
);
