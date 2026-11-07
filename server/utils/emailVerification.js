import { createHash, randomInt } from 'node:crypto';
import nodemailer from 'nodemailer';

const CODE_EXPIRATION_MINUTES = 10;

const getEmailSettings = () => {
  const SMTP_HOST = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const SMTP_PORT = (process.env.SMTP_PORT || '465').trim();
  const SMTP_SECURE = (process.env.SMTP_SECURE || 'true').trim().toLowerCase() === 'true';
  const SMTP_USER = process.env.SMTP_USER?.trim();
  const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s/g, '');
  const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || SMTP_USER;

  const missingSettings = [
    !SMTP_USER && 'SMTP_USER',
    !SMTP_PASS && 'SMTP_PASS',
    !EMAIL_FROM && 'EMAIL_FROM (or SMTP_USER)',
  ].filter(Boolean);

  return {
    settings: { SMTP_HOST, SMTP_PORT: Number(SMTP_PORT), SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM },
    missingSettings,
  };
};

export const isEmailVerificationConfigured = () =>
  getEmailSettings().missingSettings.length === 0;

export const createEmailVerificationCode = () => ({
  code: String(randomInt(100000, 1000000)),
  expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000),
});

export const hashEmailVerificationCode = (code) =>
  createHash('sha256').update(code).digest('hex');

export const sendEmailVerificationCode = async (email, code) => {
  const { settings, missingSettings } = getEmailSettings();

  if (missingSettings.length) {
    throw new Error(
      `Email verification is not configured. Set ${missingSettings.join(' and ')} in the backend environment. ` +
      'For local development, use server/.env; for a hosted deployment, set them in the backend service settings and restart or redeploy.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: settings.SMTP_PORT,
    secure: settings.SMTP_SECURE,
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: settings.EMAIL_FROM,
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
