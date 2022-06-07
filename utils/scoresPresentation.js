import User from '../DAOs/User.js';
import CustomError from '../Errors/CustomError.js';

const SCORE_VALUES = {
    NONE: 0,
    WINNER: 1,
    FULL: 2
}

const addUserScores = (predictions, groupData) => {
    let totalScore = 0;
    predictions.forEach(prediction => {
        if(prediction.score === SCORE_VALUES.WINNER) {
            totalScore += groupData.rules.scoring.WINNER;
        } 
        else if(prediction.score === SCORE_VALUES.FULL) {
            totalScore += groupData.rules.scoring.FULL;
        }
    })
    return totalScore;
}

export const calculateScoresByUsername = async (predictions, groupData) => {
    const prettifiedScores = [];
    const users = await User.getManyById(groupData.members, '_id name avatar');
    if(!users) throw new CustomError(500, 'Failed to get users');
    await users.forEach(user => {
        const userPredictions = predictions.filter(prediction => prediction.userId.toString() === user._id.toString()) || [];
        const userScore = addUserScores(userPredictions, groupData);
        prettifiedScores.push({
            user: user.name,
            avatar: user.avatar,
            score: userScore
        })
    })
    const prettyAndOrdered = prettifiedScores.sort((a, b) => b.score - a.score);
    return prettyAndOrdered;
}