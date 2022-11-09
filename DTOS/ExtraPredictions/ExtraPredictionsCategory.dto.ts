import { ExtraPredictionsCategory } from "../../Persistence/Models/Group.model";

interface IExtraPredictionCategoryInput {
  key: string;
  description: string;
  timeLimit: Date | string;
}

export class ExtraPredictionsCategoryDTO {
  key: ExtraPredictionsCategory["key"];
  description: ExtraPredictionsCategory["description"];
  timeLimit: ExtraPredictionsCategory["timeLimit"];
  constructor(data: IExtraPredictionCategoryInput) {
    this.key = data.key;
    this.description = data.description;
    this.timeLimit =
      data.timeLimit instanceof Date
        ? data.timeLimit
        : new Date(data.timeLimit);
  }
}
