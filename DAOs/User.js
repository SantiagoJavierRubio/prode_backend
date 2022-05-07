import Container from '../Containers/mongoDB.js';
import Model from '../Models/User.js';
import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
 catch (err) {
    return { error: 'Failed to hash password' };
  }
};

class User extends Container {
  constructor() {
    super(Model);
  }
  async findByEmail(email) {
    try {
      if (!email) throw new Error('Email is required');
      const user = await this.getOne({ email });
      return user;
    }
 catch (err) {
      return { error: err.message };
    }
  }
  async createWithEmail(data) {
    try {
      if (!data.email) throw new Error('Email is required');
      if (!data.password) throw new Error('Password is required');
      if (data.password.length < 6) throw new Error('Password must be at least 6 characters');
      let pwd = await hashPassword(data.password);
      if (pwd.error) throw new Error(pwd.error.message);
      if (await this.getOne({ email: data.email }))
        throw new Error('Email already in use');
      const user = await this.create({ ...data, password: pwd });
      if (!user) throw new Error('Failed to create user');
      return user;
    }
 catch (err) {
      return { error: err.message };
    }
  }
  async checkCredentials(email, password) {
    try {
      if (!email) throw new Error('Email is required');
      if (!password) throw new Error('Password is required');
      const user = await this.getOne({ email });
      if (!user) throw new Error('User not found');
      if(!user.password) throw new Error('User registered with google')
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Invalid password');
      return user;
    }
 catch (err) {
      return { error: err.message };
    }
  }
  async createWithGoogle(data) {
    try {
      const userData = {
        email: data.email,
        name:
          data.name ||
          'no name',
        verified: true
      };
      if (!userData.email) throw new Error('Email is required');
      const user = await this.create(userData);
      if (!user) throw new Error('Failed to create user');
      return user;
    }
 catch (err) {
      return err;
    }
  }
  async changePassword(user_id, password) {
    try {
      if (!password) throw new Error('Password is required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      let pwd = await hashPassword(data.password);
      if (pwd.error) throw new Error(pwd.error.message);
      const updated = await this.update(user_id, { password: pwd });
      if (!updated) throw new Error('Failed to update user');
      if (updated.error) throw new Error(updated.error.message);
      return true;
    }
    catch (err) {
      return { error: err.message };
    }
  }
}

const userDAO = new User();
export default userDAO;
