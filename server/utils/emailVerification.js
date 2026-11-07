import { createHash, randomInt } from 'node:crypto';
import nodemailer from 'nodemailer';

const CODE_EXPIRATION_MINUTES = 10;

export const createEmailVerificationCode = () => ({
  code: String(randomInt(100000, 1000000)),
  expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000),
});

export const hashEmailVerificationCode = (code) =>
  createHash('sha256').update(code).digest('hex');

export const sendEmailVerificationCode = async (email, code) => {
  const {
    SMTP_HOST = 'smtp.gmail.com',
    SMTP_PORT = '465',
    SMTP_SECURE = 'true',
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM = SMTP_USER,
  } = process.env;

  const missingSettings = [
    !SMTP_USER && 'SMTP_USER',
    !SMTP_PASS && 'SMTP_PASS',
    !EMAIL_FROM && 'EMAIL_FROM (or SMTP_USER)',
  ].filter(Boolean);

  if (missingSettings.length) {
    throw new Error(
      `Email verification is not configured. Set ${missingSettings.join(' and ')} in the backend environment. ` +
      'For local development, use server/.env; for a hosted deployment, set them in the backend service settings and restart or redeploy.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE.toLowerCase() === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Your Workzen verification code',
      text: `Your Workzen verification code is ${code}. It expires in ${CODE_EXPIRATION_MINUTES} minutes.`,
    });
  } catch (error) {
    console.error('SMTP email delivery failed:', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw new Error('Email delivery failed. Check your SMTP settings and Gmail App Password.');
  } finally {
    transporter.close();
  }
};
