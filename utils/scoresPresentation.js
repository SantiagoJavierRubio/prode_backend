import User from '../DAOs/User.js';

export const scoresWithUsername = async (scores) => {
    try {
        const prettifiedScores = [];
        const users = await User.getManyById(scores.map(score => score.userId), '_id name');
        if(!users) throw new Error('Failed to get users');
        scores.forEach(score => {
            const user = users.find(user => user._id.toString() === score.userId.toString());
            prettifiedScores.push({
                user: user.name,
                score: score.score
            });
        })
        return prettifiedScores
    }
    catch(err) {
        return new Error(`Failed to prettify scores, error: ${err}`);
    }
}