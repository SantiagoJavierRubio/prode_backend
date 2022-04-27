import mongoose from 'mongoose';

const VerificationSchema = new mongoose.Schema(
  {
    user_id: String,
    token: String,
    expiration: {
      type: Date,
      default: Date.now() + 1000 * 60 * 60 * 24
    }
  },
  { collection: 'verifications' }
);

const VerificationToken = mongoose.model(
  'VerificationToken',
  VerificationSchema
);

export default VerificationToken;
