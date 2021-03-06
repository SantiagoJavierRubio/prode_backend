import { v4 as uuid } from 'uuid';
import VerificationToken from '../Models/VerificationToken.js';
import transporter from './nodemailer.js';
import { verificationEmailTemplate, changePasswordEmailTemplate } from './templates/templates.js';
import config from '../config.js';
import CustomError from '../Errors/CustomError.js';

const generateVerificationToken = async (user_id) => {
  try {
    const token = uuid();
    const newVerification = new VerificationToken({
      user_id,
      token
    });
    await newVerification.save();
    return token;
  }
 catch (err) {
    throw new CustomError(500, 'Failed to create verification token', err.message, err);
  }
};
export const sendVerificationEmail = async (user) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/email/verify?token=${token}&user_id=${user._id}`;
    const mail = await transporter.sendMail({
      to: user.email,
      from: `Admin Prode Mundial <${config.emailAccount}>`,
      subject: 'Bienvenido a ProdeMundial, verifica tu cuenta',
      html: verificationEmailTemplate(link)
    });
    if (!mail.accepted.length > 0) throw new Error('Failed to send email');
    return { success: true };
  }
 catch (err) {
    throw new CustomError(500, 'Failed to send email', err.message, err);
  }
};
export const sendPasswordChangeEmail = async (user) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/change-password?token=${token}&user_id=${user._id}`;
    const mail = await transporter.sendMail({
      to: user.email,
      from: `Admin Prode Mundial <${config.emailAccount}>`,
      subject: 'Cambia tu contraseña',
      html: changePasswordEmailTemplate(link)
    });
    if (!mail.accepted.length > 0) throw new Error('Email rejected');
    return { success: true };
  }
 catch (err) {
    throw new CustomError(500, 'Failed to send password change email', err.message, err);
  }
}
