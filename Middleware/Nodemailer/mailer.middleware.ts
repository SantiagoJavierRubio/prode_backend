import nodemailer from "nodemailer";
import config from "../../config";
import {
  verificationEmailTemplate,
  changePasswordEmailTemplate,
} from "./templates/templates.nodemailer";

class Mailer {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: config.emailAccount,
        pass: config.emailPassword,
      },
    });
    this._checkConnection();
  }
  private _checkConnection() {
    this._transporter.verify((err) => {
      if (err) {
        console.log("Failed to connect to mail server");
        console.error(err);
      } else {
        console.log("Connected to mail server");
      }
    });
  }
  async sendVerificationEmail(
    userId: string,
    userEmail: string,
    token: string,
    language: string
  ): Promise<boolean> {
    const link = `${config.serverUrl}/auth/email/verify?token=${token}&user_id=${userId}`;
    const subject =
      language === "es"
        ? "Bienvenido a Chumbazo, verifica tu cuenta"
        : "Welcome to Chumbazo, verify your account";
    const mail = await this._transporter.sendMail({
      to: userEmail,
      from: `Chumbazo <${config.emailAccount}>`,
      subject: subject,
      html: verificationEmailTemplate(link, language),
    });
    if (!(mail.accepted.length > 0)) throw new Error("Failed to send email");
    return true;
  }
  async sendPasswordChangeEmail(
    userId: string,
    userEmail: string,
    token: string,
    language: string
  ): Promise<boolean> {
    const link = `${config.serverUrl}/auth/change-password?token=${token}&user_id=${userId}`;
    const subject =
      language === "es" ? "Cambia tu contraseña" : "Change your password";
    const mail = await this._transporter.sendMail({
      to: userEmail,
      from: `Chumbazo <${config.emailAccount}>`,
      subject: subject,
      html: changePasswordEmailTemplate(link, language),
    });
    if (!(mail.accepted.length > 0)) throw new Error("Email rejected");
    return true;
  }
}

export const mailer = new Mailer();
