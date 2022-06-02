import User from '../DAOs/User.js';
import CustomError from '../Errors/CustomError.js';

export const scoresWithUsername = async (scores) => {
    if(!scores) throw new CustomError(406, 'Missing scores')
    const prettifiedScores = [];
    const users = await User.getManyById(scores.map(score => score.userId), '_id name');
    if(!users) throw new CustomError(500, 'Failed to get users');
    scores.forEach(score => {
        const user = users.find(user => user._id.toString() === score.userId.toString());
        prettifiedScores.push({
            user: user.name,
            score: score.score
        });
    })
    return prettifiedScores
}