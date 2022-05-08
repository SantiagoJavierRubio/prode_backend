import Users from '../DAOs/users.js';

export const scoresWithUsername = async (scores) => {
    try {
        const prettifiedScores = [];
        const users = await Users.getManyById(scores.map(score => score.userId), '_id name');
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