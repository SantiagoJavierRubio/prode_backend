import { ExtraPredictionsCategory } from "../../Persistence/Models/Group.model";

interface IExtraPredictionCategoryInput {
  key: string;
  description: string;
  timeLimit: Date | string;
  score: number;
}

export class ExtraPredictionsCategoryDTO {
  key: ExtraPredictionsCategory["key"];
  description: ExtraPredictionsCategory["description"];
  timeLimit: ExtraPredictionsCategory["timeLimit"];
  score: ExtraPredictionsCategory["score"];
  constructor(data: IExtraPredictionCategoryInput) {
    this.key = data.key;
    this.description = data.description;
    this.timeLimit =
      data.timeLimit instanceof Date
        ? data.timeLimit
        : new Date(data.timeLimit);
    this.score = data.score;
  }
}
