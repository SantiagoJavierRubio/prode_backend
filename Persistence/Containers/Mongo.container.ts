import { CustomError } from "../../Errors/CustomError";
import { Model, Document, LeanDocument } from "mongoose";


export class Container<T extends Document> {
  constructor(private _model: Model<Document>) {}

  async getById(id: string, fields?: string | null): Promise<LeanDocument<T> | null> {
    try {
      return await this._model.findById(id, fields).lean();
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to obtain element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async getMany(
    options: object,
    fields?: string | null
  ): Promise<LeanDocument<T>[] | null> {
    try {
      return await this._model.find(options, fields).lean();
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to obtain elements",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async getManyById(
    ids: string[],
    fields?: string | null
  ): Promise<LeanDocument<T>[] | null> {
    try {
      return await this._model.find({ _id: { $in: ids } }, fields).lean();
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to obtain elements",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async getOne(
    match: object,
    fields?: string | null
  ): Promise<LeanDocument<T> | null> {
    try {
      return await this._model.findOne(match, fields).lean();
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to obtain element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async create(data: object): Promise<LeanDocument<T> | null> {
    try {
      const newElement = new this._model(data);
      await newElement.save();
      return this._model.findById(newElement._id).lean()
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to create element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async createMultiple(data: object[]): Promise<LeanDocument<T>[] | null> {
    try {
      const inserted = await this._model.insertMany(data);
      return await this.getManyById(inserted.map(i => i._id))
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to create element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async update(id: string, data: object): Promise<void> {
    try {
      await this._model.findByIdAndUpdate(id, data);
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to update element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this._model.findByIdAndDelete(id);
    } catch (err) {
      throw new CustomError(
        500,
        "Failed to delete element",
        err instanceof Error ? err.message : null,
        err instanceof Error ? err : null
      );
    }
  }
}
