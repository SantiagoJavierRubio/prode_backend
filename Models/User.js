import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  { collection: 'users' }
);

const User = mongoose.model('User', UserSchema);

export default User;
