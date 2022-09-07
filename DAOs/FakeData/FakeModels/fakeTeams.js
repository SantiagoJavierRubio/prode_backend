import mongoose from "mongoose";

const FakeTeamSchema = new mongoose.Schema(
  {
    name: String,
    shortName: String,
    flag: String,
  },
  { collection: "fake_teams" }
);

const FakeTeam = mongoose.model("FakeTeam", FakeTeamSchema);

export default FakeTeam;
