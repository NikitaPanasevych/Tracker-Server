// email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Click this link to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
  }
}
