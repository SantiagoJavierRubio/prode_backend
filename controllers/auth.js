import User from '../DAOs/User.js';
import { generateJwtToken } from '../authentication/jwt.js';
import { sendVerificationEmail, sendPasswordChangeEmail} from '../email/verificationEmail.js';
import VerificationToken from '../Models/VerificationToken.js';
import verifyGoogle from '../authentication/verifyGoogle.js';
import config from '../config.js';
import CustomError from '../Errors/CustomError.js';
import errorHandler from '../Errors/errorHandler.js';

export const getUserData = async (req, res, next) => {
  try {
    const user = await User.getById(req.user._id, 'email name avatar');
    if (!user) throw new CustomError(406, 'User not found');
    res.json({ user: user })
  }
  catch(err) {
      errorHandler(err, req, res, next)
  }
}
export const createWithEmail = async (req, res, next) => {
  try {
    const user = await User.createWithEmail(req.body);
    await sendVerificationEmail(user);
    res.status(200).json({ user_id: user._id });
  }
 catch (err) {
    errorHandler(err, req, res, next)
  }
};
export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    const user_id = req.query.user_id;
    const verificationToken = await VerificationToken.findOne({ user_id });
    if (!verificationToken || verificationToken.token !== token)
      throw new CustomError(406, 'Invalid token');
    if (Date.now() > token.expiration)
      throw new CustomError(406, 'Token expired');
    await User.update(user_id, { verified: true });
    await VerificationToken.findByIdAndRemove(verificationToken._id);
    res.redirect(`${config.clientUrl}/auth/verified`);
  }
 catch (err) {
    errorHandler(err, req, res, next)
  }
};
export const loginWithEmail = async (req, res, next) => {
  try {
    const user = await User.checkCredentials(
      req.body.email || null,
      req.body.password || null
    );
    if (!user.verified) throw new CustomError(401, 'User is not verified');
    const token = generateJwtToken(user);
    res.cookie('jwt', token, { sameSite: 'none', secure: true });
    res.status(200).json({ user_id: user._id });
  }
 catch (err) {
    errorHandler(err, req, res, next)
  }
};
export const googleVerified = async (req, res, next) => {
  try {
    const user = await verifyGoogle(req.body.token);
    const token = generateJwtToken(user);
    res.cookie('jwt', token, { sameSite: 'none', secure: true });
    res.sendStatus(200)
  }
  catch(err) {
    errorHandler(err, req, res, next)
  }
};
export const logout = async (req, res, next) => {
  try {
    req.logOut();
    res.clearCookie('jwt', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
  }
  catch(err) {
    errorHandler(err, req, res, next)
  }
};
export const requirePasswordChange = async (req, res, next) => {
  try {
    const email = req.body.email || null;
    const user = await User.findByEmail(email);
    if (!user.password) throw new CustomError(406, 'User registered with google', 'Try to sign in with google')
    await sendPasswordChangeEmail(user);
    res.sendStatus(200)
  }
  catch (err) {
    errorHandler(err, req, res, next)
  }
}
export const grantTemporaryVerification = async (req, res, next) => {
  try {
    const token = req.query.token;
    const user_id = req.query.user_id;
    const verificationToken = await VerificationToken.findOne({ user_id });
    if (!verificationToken || verificationToken.token !== token)
      throw new CustomError(406, 'Invalid token');
    if (Date.now() > token.expiration)
      throw new CustomError(406, 'Token expired');
    const user = await User.getById(user_id);
    await VerificationToken.findByIdAndRemove(verificationToken._id);
    const jwt = generateJwtToken(user);
    res.cookie('jwt', jwt, { sameSite: 'none', secure: true });
    res.redirect(`${config.clientUrl}/auth/change-password`);
  }
  catch(err) {
    errorHandler(err, req, res, next)
  }
}
export const changePassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password || null;
    await User.changePassword(req.body.user_id, newPassword);
    req.logOut()
    res.clearCookie('jwt', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
  } 
  catch (err) {
    errorHandler(err, req, res, next)
  }
}