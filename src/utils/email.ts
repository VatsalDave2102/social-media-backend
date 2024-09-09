import { StatusCodes } from 'http-status-codes';
import nodemailer from 'nodemailer';

import { EMAIL_PASSWORD, EMAIL_USERNAME } from './env-variables';
import { AppError } from '../middlewares/errorHandler';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: 'SocioPedia',
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError('Error sending email!', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
