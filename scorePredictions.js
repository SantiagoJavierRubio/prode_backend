import Prediction from "./DAOs/Prediction.js";
import Fifa from "./DAOs/Fifa.js";
import config from './config.js';
import mongoose from 'mongoose';

console.log('Initializing prediction scoring process...')
const MONGO_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(`${config.mongoUrl}`, MONGO_OPTIONS, (err) => {
  if (err) {
    console.log('Failed to connect to mongoDB');
    process.exit()
  }
});

const SCORE_VALUES = {
    NONE: 0,
    WINNER: 1,
    FULL: 2
}
const MATCH_RESULT_TYPES = {
    HOME: 'home',
    AWAY: 'away',
    DRAW: 'draw'
}

const getUncheckedPredictions = async () => {
    try {
        const now = new Date();
        const matches = await Fifa.getAllMatches();
        const previousMatchesIds = matches.map(match => {
            let matchDate = new Date(match.date);
            if(matchDate < now && match.status === 0) return match.id;
        })
        if(previousMatchesIds.length === 0) throw new Error('No matches to score');
        const predictions = await Prediction.getMany({checked: false, matchId: {$in: previousMatchesIds}});
        if(!predictions || predictions.length == 0) throw new Error('No predictions to score')
        return {
            matches: matches,
            predictions: predictions
        };
    }
    catch(err) {
        return {error: err.message}
    }
}
const calculateResult = (awayScore, homeScore) => {
    if(awayScore === homeScore) return MATCH_RESULT_TYPES.DRAW;
    if(awayScore > homeScore) return MATCH_RESULT_TYPES.AWAY;
    return MATCH_RESULT_TYPES.HOME;
}
const calculateScore = async (predictionHomeScore, predictionAwayScore, matchHomeScore, matchAwayScore) => {
    if(predictionAwayScore === matchAwayScore && predictionHomeScore === matchHomeScore) return SCORE_VALUES.FULL;
    const predictionResult = calculateResult(predictionAwayScore, predictionHomeScore);
    const matchResult = calculateResult(matchAwayScore, matchHomeScore);
    if(predictionResult === matchResult) return SCORE_VALUES.WINNER;
    return SCORE_VALUES.NONE;
}

const scoreOnePrediction = async (prediction, matches) => {
    try {
        const match = matches.filter(match => match.id === prediction.matchId)[0];
        const score = await calculateScore(prediction.homeScore, prediction.awayScore, match.homeScore, match.awayScore);
        const scored = await Prediction.scorePrediction(prediction._id, score);
        if(scored) {
            console.log(`Scored prediction ${prediction._id} with score ${score}`);
            return true
        }
        else {
            return false
        }
    }
    catch(err) {
        return {error: err.message}
    }
}
const addScores = async (predictions, matches) => {
    try {
        const results = {
            scored: [],
            errors: []
        }
        for (let prediction of predictions) {
            const scored = await scoreOnePrediction(prediction, matches)
            if(scored) results.scored.push(`${prediction._id}`)
            else results.errors.push(`${prediction._id}`)
        }
        return results
    }
    catch(err) {
        return { error: err.message }
    }
}
export const scorePredictions = async () => {
    try {
        const predictionData = await getUncheckedPredictions();
        if(predictionData.error) throw new Error(predictionData.error);
        return await addScores(predictionData.predictions, predictionData.matches);
    }
    catch(err) {
        return {error: err.message}
    }
}