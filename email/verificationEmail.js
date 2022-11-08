import { v4 as uuid } from "uuid";
import VerificationToken from "../Models/VerificationToken.js";
import transporter from "./nodemailer.js";
import {
  verificationEmailTemplate,
  changePasswordEmailTemplate,
} from "./templates/templates.js";
import config from "../config.js";
import CustomError from "../Errors/CustomError.js";

const generateVerificationToken = async (user_id) => {
  const exists = await VerificationToken.findOne({ user_id });
  if (exists) {
    if (exists.expiration.getTime() < Date.now())
      await VerificationToken.findByIdAndDelete(exists._id);
    else
      throw new CustomError(
        406,
        "Password change already required, check your email"
      );
  }
  const token = uuid();
  const newVerification = new VerificationToken({
    user_id,
    token,
  });
  await newVerification.save();
  return token;
};
export const sendVerificationEmail = async (user, lang) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/email/verify?token=${token}&user_id=${user._id}`;
    const subject =
      lang === "es"
        ? "Bienvenido a Chumbazo, verifica tu cuenta"
        : "Welcome to Chumbazo, verify your account";
    const mail = await transporter.sendMail({
      to: user.email,
      from: `Chumbazo <${config.emailAccount}>`,
      subject: subject,
      html: verificationEmailTemplate(link, lang),
    });
    if (!mail.accepted.length > 0) throw new Error("Failed to send email");
    return { success: true };
  } catch (err) {
    if (err instanceof CustomError) throw err;
    throw new CustomError(500, "Failed to send email", err.message, err);
  }
};
export const sendPasswordChangeEmail = async (user, lang) => {
  try {
    const token = await generateVerificationToken(user._id);
    const link = `${config.serverUrl}/auth/change-password?token=${token}&user_id=${user._id}`;
    const subject =
      lang === "es" ? "Cambia tu contraseña" : "Change your password";
    const mail = await transporter.sendMail({
      to: user.email,
      from: `Chumbazo <${config.emailAccount}>`,
      subject: subject,
      html: changePasswordEmailTemplate(link, lang),
    });
    if (!mail.accepted.length > 0) throw new Error("Email rejected");
    return { success: true };
  } catch (err) {
    if (err instanceof CustomError) throw err;
    throw new CustomError(
      500,
      "Failed to send password change email",
      err.message,
      err
    );
  }
};
