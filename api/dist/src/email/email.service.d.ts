export declare class EmailService {
    private readonly resend;
    private readonly logger;
    constructor();
    sendInvoiceEmail(to: string, clientName: string, invoiceNumber: string, pdfBuffer: Buffer): Promise<import("resend").CreateEmailResponseSuccess>;
    sendOtpEmail(to: string, otp: string): Promise<import("resend").CreateEmailResponseSuccess>;
    sendPasswordResetEmail(to: string, otp: string): Promise<import("resend").CreateEmailResponseSuccess>;
}
