import CustomError from "../Errors/CustomError.js";

class Container {
  constructor(model) {
    this.model = model;
  }
  async getById(id, fields = null) {
    try {
      const result = fields
        ? await this.model.findById(id, fields)
        : await this.model.findById(id);
      if (!result) return null;
      return result;
    } catch (err) {
      throw new CustomError(500, "Failed to obtain element", err.message, err);
    }
  }
  async getMany(options = {}, fields = null) {
    try {
      const results = fields
        ? await this.model.find(options, fields)
        : await this.model.find(options);
      if (!results) return null;
      return results;
    } catch (err) {
      throw new CustomError(500, "Failed to obtain elements", err.message, err);
    }
  }
  async getManyById(ids, fields = null) {
    try {
      const results = fields
        ? await this.model.find({ _id: { $in: ids } }, fields)
        : await this.model.find({ _id: { $in: ids } });
      if (!results) return null;
      return results;
    } catch (err) {
      throw new CustomError(500, "Failed to obtain elements", err.message, err);
    }
  }
  async getOne(match, fields = null) {
    try {
      const result = fields
        ? await this.model.findOne(match, fields)
        : await this.model.findOne(match);
      if (!result) return null;
      return result;
    } catch (err) {
      throw new CustomError(500, "Failed to obtain element", err.message, err);
    }
  }
  async create(data) {
    try {
      const newElement = new this.model(data);
      const result = await newElement.save();
      return result;
    } catch (err) {
      return new CustomError(500, "Failed to create element", err.message, err);
    }
  }
  async createMultiple(array) {
    try {
      const results = await this.model.insertMany(array);
      if (!results) throw new Error("Failed to create elements");
      return results;
    } catch (err) {
      throw new CustomError(500, "Failed to create elements", err.message, err);
    }
  }
  async update(id, data) {
    try {
      await this.model.findByIdAndUpdate(id, data);
      return true;
    } catch (err) {
      throw new CustomError(500, "Failed to update element", err.message, err);
    }
  }
  async delete(id) {
    try {
      await this.model.findByIdAndDelete(id);
      return true;
    } catch (err) {
      throw new CustomError(500, "Failed to delete element", err.message, err);
    }
  }
}

export default Container;
