import User from '../DAOs/User.js';
import { generateJwtToken } from '../authentication/jwt.js';
import { sendVerificationEmail, sendPasswordChangeEmail} from '../email/verificationEmail.js';
import VerificationToken from '../Models/VerificationToken.js';
import verifyGoogle from '../authentication/verifyGoogle.js';
import config from '../config.js';
import CustomError from '../Errors/CustomError.js';

export const getUserData = async (req, res, next) => {
  try {
    const user = await User.getById(req.user._id, 'email name');
    if (!user) throw new CustomError(406, 'User not found');
    res.json({ user: user })
  }
  catch(err) {
      next(err)
  }
}
export const createWithEmail = async (req, res) => {
  try {
    const user = await User.createWithEmail(req.body);
    if (user.error) throw new Error(user.error);
    const verificationEmail = await sendVerificationEmail(user);
    if (verificationEmail.error) throw new Error(verificationEmail.error);
    res.status(200).json({ user_id: user._id });
  }
 catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const user_id = req.query.user_id;
    const verificationToken = await VerificationToken.findOne({ user_id });
    if (!verificationToken || verificationToken.token !== token)
      throw new Error('Invalid token');
    if (Date.now() > token.expiration)
      throw new Error('Token expired');
    const verification = await User.update(user_id, { verified: true });
    if (!verification) throw new Error('Failed to verify email');
    await VerificationToken.findByIdAndRemove(verificationToken._id);
    res.redirect(`${config.clientUrl}/auth/verified`);
  }
 catch (err) {
    res.send(`Something went wrong: ${err.message}`);
  }
};
export const loginWithEmail = async (req, res) => {
  try {
    const user = await User.checkCredentials(
      req.body.email || null,
      req.body.password || null
    );
    if (user.error) throw new Error(user.error);
    if (!user.verified) throw new Error('User is not verified');
    const token = generateJwtToken(user);
    res.cookie('jwt', token, { sameSite: 'none', secure: true });
    res.status(200).json({ user_id: user._id });
  }
 catch (err) {
    res.status(401).json({ error: err.message });
  }
};
export const googleVerified = async (req, res) => {
  try {
    const user = await verifyGoogle(req.body.token);
    if (user.error) throw new Error(user.error)
    const token = generateJwtToken(user);
    res.cookie('jwt', token, { sameSite: 'none', secure: true });
    res.sendStatus(200)
  }
  catch(err) {
    res.status(401).json({ error: err.message });
  }
};
export const logout = async (req, res) => {
  try {
    req.logOut();
    res.clearCookie('jwt', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
  }
  catch(err) {
    res.status(400).json({ error: err.message })
  }
};
export const requirePasswordChange = async (req, res) => {
  try {
    const email = req.body.email || null;
    if(!email) throw new Error('Email is required');
    const user = await User.findByEmail(email);
    if (!user) throw new Error('User not found');
    if (user.error) throw new Error(user.error);
    const passwordChangeEmail = await sendPasswordChangeEmail(user);
    if (passwordChangeEmail.error) throw new Error(passwordChangeEmail.error);
    res.sendStatus(200)
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
}
export const grantTemporaryVerification = async (req, res) => {
  try {
    const token = req.query.token;
    const user_id = req.query.user_id;
    const verificationToken = await VerificationToken.findOne({ user_id });
    if (!verificationToken || verificationToken.token !== token)
      throw new Error('Invalid token');
    if (Date.now() > token.expiration)
      throw new Error('Token expired');
    const user = await User.getById(user_id);
    if (!user) throw new Error('User not found');
    if (user.error) throw new Error(user.error);
    await VerificationToken.findByIdAndRemove(verificationToken._id);
    const jwt = generateJwtToken(user);
    res.cookie('jwt', jwt, { sameSite: 'none', secure: true });
    res.redirect(`${config.clientUrl}/auth/change-password`);
  }
  catch(err) {
    res.send(`Something went wrong: ${err.message}`);
  }
}
export const changePassword = async (req, res) => {
  try {
    const newPassword = req.body.password || null;
    if (!newPassword) throw new Error('New password required');
    const updated = await User.changePassword(req.body.user_id, newPassword);
    if (!updated) throw new Error('Failed to update password');
    if (updated.error) throw new Error(updated.error);
    req.logOut()
    res.clearCookie('jwt', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
  } 
  catch (err) {
    res.status(400).json({error: err.message})
  }
}