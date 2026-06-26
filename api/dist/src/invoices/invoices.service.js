"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto = __importStar(require("crypto"));
const email_service_1 = require("../email/email.service");
let InvoicesService = class InvoicesService {
    prisma;
    emailService;
    s3Client;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.s3Client = new client_s3_1.S3Client({
            endpoint: `https://${process.env.B2_ENDPOINT}`,
            region: process.env.B2_REGION || 'us-west-004',
            credentials: {
                accessKeyId: process.env.B2_KEY_ID || '',
                secretAccessKey: process.env.B2_APPLICATION_KEY || '',
            },
        });
    }
    async uploadLogoToB2(base64Image) {
        const bucketName = process.env.B2_BUCKET_NAME;
        if (!bucketName) {
            console.warn('B2_BUCKET_NAME not set');
            return '';
        }
        const matches = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches) {
            throw new common_1.BadRequestException('Invalid base64 image format');
        }
        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `logos/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: `image/${matches[1]}`,
        });
        await this.s3Client.send(command);
        return `https://${process.env.B2_ENDPOINT}/${bucketName}/${fileName}`;
    }
    async create(userId, dto) {
        const number = dto.number || `INV-${Date.now()}`;
        const taxRate = dto.taxRate || 0;
        let logoUrl = undefined;
        if (dto.logo) {
            if (dto.logo.startsWith('data:image/')) {
                logoUrl = await this.uploadLogoToB2(dto.logo);
            }
            else {
                logoUrl = dto.logo;
            }
        }
        let subtotal = 0;
        const itemsData = dto.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice;
            subtotal += lineTotal;
            return {
                ...item,
                lineTotal,
            };
        });
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        return this.prisma.invoice.create({
            data: {
                userId,
                clientId: dto.clientId,
                number,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                currency: dto.currency || 'USD',
                notes: dto.notes,
                logoUrl,
                subtotal,
                taxRate,
                taxAmount,
                total,
                items: {
                    create: itemsData,
                },
            },
            include: { items: true, client: true },
        });
    }
    async findAll(userId) {
        return this.prisma.invoice.findMany({
            where: { userId },
            include: { client: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, userId },
            include: { items: true, client: true, user: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async updateStatus(userId, id, dto) {
        await this.findOne(userId, id);
        return this.prisma.invoice.update({
            where: { id },
            data: { status: dto.status },
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.invoice.delete({
            where: { id },
        });
    }
    async update(userId, id, dto) {
        const invoice = await this.findOne(userId, id);
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('PAID invoices cannot be edited');
        }
        let itemsData = [];
        let subtotal = 0;
        let taxRate = dto.taxRate !== undefined ? dto.taxRate : Number(invoice.taxRate);
        let taxAmount = Number(invoice.taxAmount);
        let total = Number(invoice.total);
        if (dto.items) {
            itemsData = dto.items.map(item => {
                const lineTotal = item.quantity * item.unitPrice;
                subtotal += lineTotal;
                return {
                    ...item,
                    lineTotal,
                };
            });
            taxAmount = subtotal * (taxRate / 100);
            total = subtotal + taxAmount;
        }
        let logoUrl = undefined;
        if (dto.logo) {
            if (dto.logo.startsWith('data:image/')) {
                logoUrl = await this.uploadLogoToB2(dto.logo);
            }
            else {
                logoUrl = dto.logo;
            }
        }
        return this.prisma.$transaction(async (tx) => {
            if (dto.items) {
                await tx.invoiceItem.deleteMany({
                    where: { invoiceId: id },
                });
            }
            return tx.invoice.update({
                where: { id },
                data: {
                    clientId: dto.clientId,
                    number: dto.number,
                    issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    currency: dto.currency,
                    notes: dto.notes,
                    logoUrl: dto.logo !== undefined ? logoUrl : undefined,
                    taxRate: dto.taxRate !== undefined ? dto.taxRate : undefined,
                    subtotal: dto.items ? subtotal : undefined,
                    taxAmount: dto.items ? taxAmount : undefined,
                    total: dto.items ? total : undefined,
                    items: dto.items ? {
                        create: itemsData,
                    } : undefined,
                },
                include: { items: true, client: true },
            });
        });
    }
    async generatePdfBuffer(userId, id) {
        const invoice = await this.findOne(userId, id);
        if (!handlebars.helpers.formatCurrency) {
            handlebars.registerHelper('formatCurrency', function (amount, currency) {
                const isUSD = !currency || currency === 'USD';
                return `${isUSD ? 'US$' : currency + ' '}${Number(amount).toFixed(2)}`;
            });
        }
        let templateHtml = '';
        try {
            const templatePath = path.join(__dirname, 'templates', 'invoice.hbs');
            templateHtml = await fs.readFile(templatePath, 'utf8');
        }
        catch (e) {
            const templatePath = path.join(process.cwd(), 'src', 'invoices', 'templates', 'invoice.hbs');
            templateHtml = await fs.readFile(templatePath, 'utf8');
        }
        const template = handlebars.compile(templateHtml);
        const formattedDate = invoice.issueDate
            ? new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const html = template({
            invoice,
            senderName: invoice.user?.name || invoice.from || 'Fawad Ahmed',
            formattedDate
        });
        const browser = await puppeteer_1.default.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        await browser.close();
        return { invoice, pdfBuffer: Buffer.from(pdfBuffer) };
    }
    async generatePdf(userId, id, res) {
        const { invoice, pdfBuffer } = await this.generatePdfBuffer(userId, id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.number}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    }
    async sendInvoiceEmail(userId, id) {
        const { invoice, pdfBuffer } = await this.generatePdfBuffer(userId, id);
        const toEmail = invoice.client?.email || invoice.user?.email || 'delivered@resend.dev';
        await this.emailService.sendInvoiceEmail(toEmail, invoice.client?.name || 'Valued Client', invoice.number, pdfBuffer);
        await this.prisma.invoice.update({
            where: { id },
            data: { status: client_1.InvoiceStatus.SENT },
        });
        return { message: 'Email sent successfully', status: 'SENT' };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, email_service_1.EmailService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map