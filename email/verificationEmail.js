import { v4 as uuid } from 'uuid';
import VerificationToken from '../Models/VerificationToken.js';
import transporter from './nodemailer.js';
import { verificationEmailTemplate, changePasswordEmailTemplate } from './templates/templates.js';
import config from '../config.js';

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
    throw new Error(err.message);
  }
};
export const sendVerificationEmail = async (user) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/email/verify?token=${token}&user_id=${user._id}`;
    const mail = await transporter.sendMail({
      to: user.email,
      from: 'No Reply - ProdeMundial <MundialProde@outlook.com>',
      subject: 'Bienvenido a ProdeMundial, verifica tu cuenta',
      html: verificationEmailTemplate(link)
    });
    if (!mail.accepted.length > 0) throw new Error('Failed to send email');
    return { success: true };
  }
 catch (err) {
    return { error: err.message };
  }
};
export const sendPasswordChangeEmail = async (user) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/change-password?token=${token}&user_id=${user._id}`;
    const mail = await transporter.sendMail({
      to: user.email,
      from: 'No Reply - ProdeMundial <MundialProde@outlook.com>',
      subject: 'Cambia tu contraseña',
      html: changePasswordEmailTemplate(link)
    });
    if (!mail.accepted.length > 0) throw new Error('Failed to send email');
    return { success: true };
  }
 catch (err) {
    return { error: err.message };
  }
}
