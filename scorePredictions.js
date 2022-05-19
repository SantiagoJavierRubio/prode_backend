import Prediction from "./DAOs/Prediction.js";
import Score from "./DAOs/Scores.js";
import Fifa from "./DAOs/Fifa.js";

const SCORE_VALUES = {
    NONE: 0,
    WINNER: 1,
    FULL: 3
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
            if(matchDate < now && !match.status === 0) return match.id;
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
const calculateScore = (predictionHomeScore, predictionAwayScore, matchHomeScore, matchAwayScore) => {
    if(predictionAwayScore === matchAwayScore && predictionHomeScore === matchHomeScore) return SCORE_VALUES.FULL;
    const predictionResult = calculateResult(predictionAwayScore, predictionHomeScore);
    const matchResult = calculateResult(matchAwayScore, matchHomeScore);
    if(predictionResult === matchResult) return SCORE_VALUES.WINNER;
    return SCORE_VALUES.NONE;
}
const scoreOnePrediction = async (prediction, matches) => {
    try {
        const match = matches.filter(match => match.id === prediction.matchId)[0];
        const score = calculateScore(prediction.homeScore, prediction.awayScore, match.homeScore, match.awayScore);
        if(score === 0) return false
        await Score.addScore(prediction.groupId, prediction.userId, score)
        return prediction._id
    }
    catch(err) {
        return {error: err.message}
    }
}
const addScores = async (predictions, matches) => {
    try {
        const results = {
            scored: [],
            failed: []
        }
        await predictions.forEach(async prediction => {
            const scoredPrediction = await scoreOnePrediction(prediction, matches);
            if(scoredPrediction.error) results.failed.push({id: prediction._id, error: scoredPrediction.error});
            else if (scoredPrediction) results.scored.push(scoredPrediction)
        })
        return results
    }
    catch(err) {
        return { error: err.message }
    }
}
const scorePredictions = async () => {
    try {
        const predictionData = await getUncheckedPredictions();
        if(predictionData.error) throw new Error(predictionData.error);
        const scoredPredictions = await addScores(predictionData.predictions, predictionData.matches);
        if(scoredPredictions.error) throw new Error(scoredPredictions.error);
        if(scoredPredictions.failed.length > 0) console.warn('Failed to score predictions: ', scoredPredictions.failed)
        if(scoredPredictions.scored.length === 0) throw new Error('No predictions scored');
        const checkedPredictions = await Prediction.checkPredictions(scoredPredictions.scored);
        if(checkedPredictions.error) throw new Error(checkedPredictions.error);
        return checkedPredictions
    }
    catch(err) {
        return {error: err.message}
    }
}

export default scorePredictions;