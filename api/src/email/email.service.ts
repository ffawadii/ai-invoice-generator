import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendInvoiceEmail(to: string, clientName: string, invoiceNumber: string, pdfBuffer: Buffer) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || 'AI Invoice Generator <onboarding@resend.dev>',
        to: [to],
        subject: `Invoice #${invoiceNumber} from AI Invoice Generator`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${clientName},</h2>
            <p>Please find attached your invoice <strong>#${invoiceNumber}</strong>.</p>
            <p>Thank you for your business!</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Powered by AI Invoice Generator</p>
          </div>
        `,
        attachments: [
          {
            filename: `invoice-${invoiceNumber}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (error) {
        this.logger.error('Failed to send email', error);
        throw error;
      }

      this.logger.log(`Email sent successfully: ${data?.id}`);
      return data;
    } catch (err) {
      this.logger.error('Failed to send email', err);
      throw err;
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || 'AI Invoice <onboarding@resend.dev>',
        to: [to],
        subject: `Your Verification Code: ${otp}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>It expires in 15 minutes. Do not share this code with anyone.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Powered by AI Invoice Generator</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error('Failed to send OTP email', error);
        throw error;
      }

      this.logger.log(`OTP Email sent successfully: ${data?.id}`);
      return data;
    } catch (err) {
      this.logger.error('Failed to send OTP email', err);
      throw err;
    }
  }

  async sendPasswordResetEmail(to: string, otp: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || 'AI Invoice <onboarding@resend.dev>',
        to: [to],
        subject: `Reset Your Password - Verification Code: ${otp}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset. Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>It expires in 15 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Powered by AI Invoice Generator</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error('Failed to send Password Reset email', error);
        throw error;
      }

      this.logger.log(`Password Reset Email sent successfully: ${data?.id}`);
      return data;
    } catch (err) {
      this.logger.error('Failed to send Password Reset email', err);
      throw err;
    }
  }
}
