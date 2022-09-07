import mongoose from "mongoose";

const FakeMatchSchema = new mongoose.Schema(
  {
    stage: String,
    stageId: String,
    group: String,
    groupId: String,
    home: Object || String,
    away: Object || String,
    homeScore: Number,
    awayScore: Number,
    stadiumId: String,
    stadium: String,
    date: Date,
    status: Number,
    winner: String,
  },
  { collection: "fake_matches" }
);

const FakeMatch = mongoose.model("FakeMatch", FakeMatchSchema);

export default FakeMatch;
