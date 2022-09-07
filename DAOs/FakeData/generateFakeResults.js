// import fs from 'fs'
import FakeMatch from "./FakeModels/fakeMatch.js";

class FakeResultGenerator {
  createOneScore() {
    return Math.floor(Math.random() * 4);
  }
  async createOneResult(match) {
    const fakeHomeScore = this.createOneScore();
    const fakeAwayScore = this.createOneScore();
    let winner = null;
    if (fakeHomeScore > fakeAwayScore) winner = match.home.id;
    if (fakeAwayScore > fakeHomeScore) winner = match.away.id;
    if (!winner && match.stageId != "111111") {
      winner = Math.random() > 0.5 ? match.away.id : match.home.id;
    }
    await FakeMatch.findByIdAndUpdate(match._id, {
      homeScore: fakeHomeScore,
      awayScore: fakeAwayScore,
      winner,
      status: 0,
    });
  }
  async createFakeResultsToDate() {
    const matches = await FakeMatch.find().lean();
    matches.map((match) => {
      let matchDate = new Date(match.date).getTime();
      if (Date.now() > matchDate && match.status !== 0) {
        return this.createOneResult(match);
      }
    });
  }
}

export default FakeResultGenerator;
