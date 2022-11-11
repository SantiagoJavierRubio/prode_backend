import { PredictionDAO } from "../DAOS/Prediction.dao";
import { UserDAO } from "../DAOS/User.dao";
import { ExtraPredictionsDAO } from "../DAOS/ExtraPredictions.dao";
import { LeanDocument } from "mongoose";
import { GroupDocument } from "../Models/Group.model";
import { CustomError } from "../../Middleware/Errors/CustomError";

type ExtraPredictionByUser = {
  [k: string]: {
    user: {
      name: string;
      avatar: string | undefined;
    };
    predictions: {
      [key: string]: string;
    };
  };
};

export class Scores {
  private predictions = new PredictionDAO();
  private users = new UserDAO();
  private extraPredictions = new ExtraPredictionsDAO();

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

  async getExtraPredictionsResultsByUser(
    groupData: LeanDocument<GroupDocument>
  ): Promise<ExtraPredictionByUser | []> {
    if (!groupData.extraPredictions || groupData.extraPredictions.length === 0)
      throw new CustomError(404, "Group has no extra predictions");
    const userGroupExtraPredictions = await this.extraPredictions.getAllByGroup(
      groupData._id
    );
    if (!userGroupExtraPredictions)
      throw new CustomError(404, "Extra predictions not found");
    const usersIds = userGroupExtraPredictions.map(
      (userPredicted) => userPredicted.userId
    );
    const usersData = await this.users.getManyById(usersIds, "name avatar");
    if (!usersData) throw new CustomError(500, "Failed to get users");
    const fieldToDisplay = groupData.extraPredictions.map((field) => {
      if (new Date(field.timeLimit).getTime() < Date.now()) return field.key;
    });
    if (fieldToDisplay.length === 0) return [];
    return Object.fromEntries(
      new Map(
        userGroupExtraPredictions.map((userPredictions) => {
          const user = usersData.filter(
            (u) => u._id.toString() === userPredictions.userId
          )[0];
          const predictionArray = Object.entries(userPredictions.predictions);
          const predictionsMap = new Map<string, string>(
            predictionArray.filter(([key, value]) =>
              fieldToDisplay.includes(key)
            )
          );
          return [
            userPredictions.userId.toString(),
            {
              user: {
                name: user.name,
                avatar: user.avatar,
              },
              predictions: Object.fromEntries(predictionsMap),
            },
          ];
        })
      )
    );
  }
}
