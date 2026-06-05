import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('⚠️  SMTP not configured. Emails will be logged only.');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  if (!transport) {
    logger.info(`📧 [EMAIL-DEV] To: ${options.to} | Subject: ${options.subject}`);
    return;
  }

  try {
    await transport.sendMail({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      ...options,
    });
    logger.info(`📧 Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
}

// ===== Email Templates =====
export const emailService = {
  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email — Traveloop AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
          <h1 style="color: #6366f1; margin-bottom: 8px;">Welcome to Traveloop AI! ✈️</h1>
          <p style="font-size: 16px; color: #94a3b8;">Hi ${name},</p>
          <p style="font-size: 16px; color: #cbd5e1;">Please verify your email to start planning amazing trips.</p>
          <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p style="font-size: 13px; color: #64748b;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    });
  },

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset Your Password — Traveloop AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
          <h1 style="color: #6366f1;">Password Reset 🔑</h1>
          <p style="color: #94a3b8;">Hi ${name},</p>
          <p style="color: #cbd5e1;">Click below to reset your password. This link expires in 1 hour.</p>
          <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 13px; color: #64748b;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: 'Welcome to Traveloop AI! ✈️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
          <h1 style="color: #6366f1;">Welcome aboard, ${name}! 🌍</h1>
          <p style="color: #cbd5e1;">Your account is ready. Start planning your dream trip today with AI-powered recommendations.</p>
          <a href="${env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Go to Dashboard</a>
        </div>
      `,
    });
  },

  async sendBudgetAlertEmail(email: string, name: string, tripName: string, percentUsed: number): Promise<void> {
    await sendEmail({
      to: email,
      subject: `⚠️ Budget Alert: ${tripName} — Traveloop AI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
          <h1 style="color: #f59e0b;">Budget Alert ⚠️</h1>
          <p style="color: #94a3b8;">Hi ${name},</p>
          <p style="color: #cbd5e1;">You've used <strong style="color: #f59e0b;">${percentUsed}%</strong> of your budget for <strong>${tripName}</strong>.</p>
          <a href="${env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Review Budget</a>
        </div>
      `,
    });
  },
};
