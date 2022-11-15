import { PredictionDAO } from "../Persistence/DAOS/Prediction.dao";
import {
  PredictionDocument,
  PredictionT,
} from "../Persistence/Models/Prediction.model";
import { Match } from "../DTOS/Fixture/fifa.match.dto";
import { FifaDAO } from "../Persistence/DAOS/Fifa.dao";
import { GroupDAO } from "../Persistence/DAOS/Group.dao";
import { UserGroupRules } from "../Persistence/Models/Group.model";
import { Connections } from "../connections";
import { LeanDocument } from "mongoose";

console.log(
  "____#################\n Initializing scoring process \n____#################\n"
);
const connect = new Connections();
const fifa = new FifaDAO();
const groups = new GroupDAO();
const predictions = new PredictionDAO();

connect.createConnections();

const MATCH_RESULT_TYPES = {
  HOME: "home",
  AWAY: "away",
  DRAW: "draw",
};

interface IUserGroupScoring {
  [key: string]: UserGroupRules["scoring"];
}

interface IScoringResults {
  scored: string[];
  errors: string[];
}

const userGroupsScoringValues: IUserGroupScoring = {};

const getUncheckedPredictions = async () => {
  const now = Date.now();
  const matches = await fifa.getAllMatches();
  const previousMatchsIds = matches.map((match) => {
    if (match.date.getTime() < now && match.status === 0) return match.id;
  });
  if (previousMatchsIds.length === 0) throw new Error("No matches to score");
  const uncheckedPredictions = await predictions.getMany({
    checked: false,
    matchId: { $in: previousMatchsIds },
  });
  if (!uncheckedPredictions || uncheckedPredictions.length === 0)
    throw new Error("No predictions to score");
  return {
    matches,
    predictions: uncheckedPredictions,
  };
};

const getGroupRules = async (
  predictions: LeanDocument<PredictionDocument>[]
) => {
  const uniqueGroupsIds = [...new Set(predictions.map((p) => p.userGroupId))];
  const uniqueGroups = await groups.getManyById(uniqueGroupsIds, "rules");
  if (!uniqueGroups || uniqueGroups.length === 0)
    throw new Error("No groups to score");
  uniqueGroups.forEach((group) => {
    if (group._id && group.rules) {
      userGroupsScoringValues[`${group._id}`] = group.rules.scoring;
    }
  });
};

const calculateResult = (awayScore: number, homeScore: number): string => {
  if (awayScore === homeScore) return MATCH_RESULT_TYPES.DRAW;
  if (awayScore > homeScore) return MATCH_RESULT_TYPES.AWAY;
  return MATCH_RESULT_TYPES.HOME;
};

const calculateScore = (
  predictionHomeScore: PredictionT["homeScore"],
  predictionAwayScore: PredictionT["awayScore"],
  matchHomeScore: Match["homeScore"],
  matchAwayScore: Match["awayScore"],
  scoringValues: UserGroupRules["scoring"]
): number => {
  if (matchHomeScore === null || matchAwayScore === null)
    throw new Error("Bad match result");
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

const scoreOnePrediction = async (
  prediction: LeanDocument<PredictionDocument>,
  matches: Match[]
) => {
  try {
    const match = matches.filter((match) => match.id === prediction.matchId)[0];
    if (!match) throw new Error("No match for prediction");
    const score = calculateScore(
      prediction.homeScore,
      prediction.awayScore,
      match.homeScore,
      match.awayScore,
      userGroupsScoringValues[prediction.userGroupId]
    );
    await predictions.scorePrediction(prediction._id, score);
    return true;
  } catch (err) {
    return false;
  }
};

const addScores = async (
  predictions: LeanDocument<PredictionDocument>[],
  matches: Match[]
) => {
  const results: IScoringResults = { scored: [], errors: [] };
  for (let prediction of predictions) {
    if (await scoreOnePrediction(prediction, matches)) {
      results.scored.push(prediction._id.toString());
    } else results.errors.push(prediction._id.toString());
  }
  return results;
};

const scorePredictions = async () => {
  const predictionData = await getUncheckedPredictions();
  await getGroupRules(predictionData.predictions);
  return await addScores(predictionData.predictions, predictionData.matches);
};

const main = async (): Promise<void> => {
  try {
    const start = process.hrtime();
    const result = await scorePredictions();
    const end = process.hrtime(start);
    const time = (end[0] * 1e9 + end[1]) / 1e9;
    if (result.scored)
      console.log(
        "! --- @ --- !\n",
        `Scored ${result.scored.length} predictions in ${time} seconds`
      );
  } catch (err) {
    if (err instanceof Error) console.log("### --->", err.message);
    else console.log(err);
  } finally {
    process.exit();
  }
};

main();
