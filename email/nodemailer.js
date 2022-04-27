import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  auth: {
    user: config.emailAccount,
    pass: config.emailPassword
  }
});
transporter.verify((err) => {
  if (err) {
    console.log('Failed to connect to mail server');
    console.error(err);
  }
 else {
    console.log('Connected to mail server');
  }
});

export default transporter;
