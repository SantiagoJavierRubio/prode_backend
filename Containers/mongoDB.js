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
    }
 catch (err) {
      return new Error(`Failed to obtain element, error: ${err}`);
    }
  }
  async getMany(options = {}, fields = null) {
    try {
      const results = fields
        ? await this.model.find(options, fields)
        : await this.model.find(options);
      if (!results) return null;
      return results;
    }
 catch (err) {
      return new Error(`Failed to obtain elements, error: ${err}`);
    }
  }
  async getOne(match, fields = null) {
    try {
      const result = fields
        ? await this.model.findOne(match, fields)
        : await this.model.findOne(match);
      if (!result) return null;
      return result;
    }
 catch (err) {
      return new Error(`Failed to obtain element, error: ${err}`);
    }
  }
  async create(data) {
    try {
      const newElement = new this.model(data);
      const result = await newElement.save();
      if (!result) throw new Error('Failed to create element');
      return result;
    }
 catch (err) {
      return new Error(`Failed to create element, error: ${err}`);
    }
  }
  async createMultiple(array) {
    try {
      const results = await this.model.insertMany(array);
      if (!results) throw new Error('Failed to create elements');
      return results
    }
    catch(err) {
      return new Error(`Failed to create elements, error: ${err}`);
    }
  }
  async update(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(id, data);
      if (!result) throw new Error('Failed to update element');
      return true;
    }
 catch (err) {
      return new Error(`Failed to update element, error: ${err}`);
    }
  }
  async delete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      if (!result) throw new Error('Failed to delete element');
      return true;
    }
 catch (err) {
      return new Error(`Failed to delete element, error: ${err}`);
    }
  }
}

export default Container;
