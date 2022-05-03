import User from '../DAOs/User.js';
import { generateJwtToken } from '../authentication/jwt.js';
import sendVerificationEmail from '../email/verificationEmail.js';
import VerificationToken from '../Models/VerificationToken.js';
import verifyGoogle from '../authentication/verifyGoogle.js';
import config from '../config.js';

export const createWithEmail = async (req, res) => {
  try {
    const user = await User.createWithEmail(req.body);
    if (user.error) throw new Error(user.error);
    const verificationEmail = await sendVerificationEmail(user);
    if (verificationEmail.error) throw new Error(verificationEmail.error);
    res.json({ user_id: user._id });
  }
 catch (err) {
    res.status(401).json({ error: err.message });
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
      return res.redirect('/auth/email/token-expired');
    const verification = await User.update(user_id, { verified: true });
    if (!verification) throw new Error('Failed to verify email');
    await VerificationToken.findByIdAndRemove(verificationToken._id);
    res.sendFile('emailVerified.html', { root: `${process.cwd()}/public` });
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
    res.redirect(config.clientUrl);
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
export const logout =
  ('/logout',
  (req, res) => {
    req.logOut();
    res.clearCookie('jwt', { path: '/', sameSite: 'none', secure: true });
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
  });
