import User from "../DAOs/User.js";
import CustomError from "../Errors/CustomError.js";

export const calculateScoresByUsername = async (predictions, groupData) => {
  const prettifiedScores = [];
  const users = await User.getManyById(groupData.members, "_id name avatar");
  if (!users) throw new CustomError(500, "Failed to get users");
  await users.forEach((user) => {
    const userPredictions =
      predictions.filter(
        (prediction) => prediction.userId.toString() === user._id.toString()
      ) || [];
    const userScore = userPredictions.reduce(
      (acc, curr) => (acc += curr.score),
      0
    );
    prettifiedScores.push({
      user: user.name,
      avatar: user.avatar,
      score: userScore,
    });
  });
  const prettyAndOrdered = prettifiedScores.sort((a, b) => b.score - a.score);
  return prettyAndOrdered;
};
