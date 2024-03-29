import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { ENV_PATH } from './constant';
dotenv.config({ path: ENV_PATH });

export const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  pool: true,
  secure: true,
  auth: {
    type: 'login',
    user: `${process.env.EMAIL_ADDRESS}`,
    pass: `${process.env.EMAIL_PASSWORD}`,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
