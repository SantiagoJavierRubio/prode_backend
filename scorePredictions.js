import Prediction from "./DAOs/Prediction.js";
import FifaRepository from "./DAOs/Repositories/FifaRepository.js";
import Group from "./DAOs/Group.js";
import config from "./config.js";
import mongoose from "mongoose";

const fifa = new FifaRepository();

console.log("Initializing prediction scoring process...");
const MONGO_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(`${config.mongoUrl}`, MONGO_OPTIONS, (err) => {
  if (err) {
    console.log("Failed to connect to mongoDB");
    process.exit();
  }
});

const MATCH_RESULT_TYPES = {
  HOME: "home",
  AWAY: "away",
  DRAW: "draw",
};

const userGroupsScoringValues = {};

const getUncheckedPredictions = async () => {
  try {
    const now = new Date();
    const matches = await fifa.getAllMatches();
    const previousMatchesIds = matches.map((match) => {
      let matchDate = new Date(match.date);
      if (matchDate < now && match.status === 0) return match.id;
    });
    if (previousMatchesIds.length === 0) throw new Error("No matches to score");
    const predictions = await Prediction.getMany({
      checked: false,
      matchId: { $in: previousMatchesIds },
    });
    if (!predictions || predictions.length == 0)
      throw new Error("No predictions to score");
    return {
      matches: matches,
      predictions: predictions,
    };
  } catch (err) {
    return { error: err.message };
  }
};
const calculateResult = (awayScore, homeScore) => {
  if (awayScore === homeScore) return MATCH_RESULT_TYPES.DRAW;
  if (awayScore > homeScore) return MATCH_RESULT_TYPES.AWAY;
  return MATCH_RESULT_TYPES.HOME;
};
const calculateScore = async (
  predictionHomeScore,
  predictionAwayScore,
  matchHomeScore,
  matchAwayScore,
  scoringValues
) => {
  if (
    predictionAwayScore === matchAwayScore &&
    predictionHomeScore === matchHomeScore
  )
    return scoringValues.FULL;
  const predictionResult = calculateResult(
    predictionAwayScore,
    predictionHomeScore
  );
  const matchResult = calculateResult(matchAwayScore, matchHomeScore);
  if (predictionResult === matchResult) return scoringValues.WINNER;
  return scoringValues.NONE;
};

const scoreOnePrediction = async (prediction, matches) => {
  try {
    const match = matches.filter((match) => match.id === prediction.matchId)[0];
    const score = await calculateScore(
      prediction.homeScore,
      prediction.awayScore,
      match.homeScore,
      match.awayScore,
      userGroupsScoringValues[prediction.userGroupId]
    );
    const scored = await Prediction.scorePrediction(prediction._id, score);
    if (scored) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return { error: err.message };
  }
};
const addScores = async (predictions, matches) => {
  try {
    const results = {
      scored: [],
      errors: [],
    };
    for (let prediction of predictions) {
      const scored = await scoreOnePrediction(prediction, matches);
      if (scored) results.scored.push(`${prediction._id}`);
      else results.errors.push(`${prediction._id}`);
    }
    return results;
  } catch (err) {
    return { error: err.message };
  }
};
const getGroupRules = async (predictions) => {
  const uniqueGroups = [...new Set(predictions.map((p) => p.userGroupId))];
  const groups = await Group.getManyById(uniqueGroups, "rules");
  groups.forEach((group) => {
    userGroupsScoringValues[`${group._id}`] = group.rules.scoring;
  });
};
const scorePredictions = async () => {
  try {
    const predictionData = await getUncheckedPredictions();
    if (predictionData.error) throw new Error(predictionData.error);
    await getGroupRules(predictionData.predictions);
    return await addScores(predictionData.predictions, predictionData.matches);
  } catch (err) {
    return { error: err.message };
  }
};

const main = async () => {
  const start = process.hrtime();
  const result = await scorePredictions();
  const end = process.hrtime(start);
  const time = (end[0] * 1e9 + end[1]) / 1e9;
  if (result.scored)
    console.log(
      `Scored ${result.scored.length} predictions in ${time} seconds`
    );
  else console.log(result);
  process.exit();
};

main();
