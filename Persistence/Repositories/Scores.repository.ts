import { PredictionDAO } from "../DAOS/Prediction.dao";
import { UserDAO } from "../DAOS/User.dao";
import { LeanDocument } from "mongoose";
import { GroupDocument } from "../Models/Group.model";
import { CustomError } from "../../Middleware/Errors/CustomError";

export class Scores {
  private predictions = new PredictionDAO();
  private users = new UserDAO();

  async getScoresByUser(groupData: LeanDocument<GroupDocument>) {
    const predictions = await this.predictions.getAllInGroup(groupData._id);
    const groupUsers = await this.users.getManyById(
      groupData.members,
      "name avatar"
    );
    if (!groupUsers) throw new CustomError(500, "Failed to get users");
    return {
      scores: groupUsers
        .map((user) => {
          const userScore = predictions
            ? predictions
                .filter(
                  (prediction) => prediction.userId === user._id.toString()
                )
                .reduce((acc, curr) => (acc += curr.score), 0)
            : 0;
          return {
            user: user.name,
            avatar: user.avatar,
            score: userScore,
          };
        })
        .sort((a, b) => b.score - a.score),
      owner: groupUsers.filter(
        (user) => user._id.toString() === groupData.owner
      )[0],
    };
  }
}
