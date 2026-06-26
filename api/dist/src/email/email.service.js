"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    resend;
    logger = new common_1.Logger(EmailService_1.name);
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    async sendInvoiceEmail(to, clientName, invoiceNumber, pdfBuffer) {
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
        }
        catch (err) {
            this.logger.error('Failed to send email', err);
            throw err;
        }
    }
    async sendOtpEmail(to, otp) {
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
        }
        catch (err) {
            this.logger.error('Failed to send OTP email', err);
            throw err;
        }
    }
    async sendPasswordResetEmail(to, otp) {
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
        }
        catch (err) {
            this.logger.error('Failed to send Password Reset email', err);
            throw err;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map