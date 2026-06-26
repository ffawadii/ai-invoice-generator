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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    emailService;
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('User already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.pendingUser.upsert({
            where: { email: dto.email },
            update: {
                passwordHash,
                name: dto.name,
                otp,
                expiresAt,
            },
            create: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                otp,
                expiresAt,
            },
        });
        console.log(`[DEV ONLY] OTP for ${dto.email} is ${otp}`);
        await this.emailService.sendOtpEmail(dto.email, otp);
        return { message: 'OTP sent to your email successfully', email: dto.email };
    }
    async verifyOtp(dto) {
        const pending = await this.prisma.pendingUser.findUnique({
            where: { email: dto.email },
        });
        if (!pending) {
            throw new common_1.UnauthorizedException('No pending registration found for this email');
        }
        if (pending.otp !== dto.otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        if (pending.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('OTP has expired');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const user = await this.prisma.user.create({
            data: {
                email: pending.email,
                passwordHash: pending.passwordHash,
                name: pending.name,
            },
        });
        await this.prisma.pendingUser.delete({
            where: { id: pending.id },
        });
        return this.loginUser(user.id, user.email);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.loginUser(user.id, user.email);
    }
    loginUser(userId, email) {
        const payload = { sub: userId, email };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async resendOtp(dto) {
        const pending = await this.prisma.pendingUser.findUnique({
            where: { email: dto.email },
        });
        if (!pending) {
            throw new common_1.UnauthorizedException('No pending registration found for this email');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.pendingUser.update({
            where: { email: dto.email },
            data: {
                otp,
                expiresAt,
            },
        });
        console.log(`[DEV ONLY] Resent OTP for ${dto.email} is ${otp}`);
        await this.emailService.sendOtpEmail(dto.email, otp);
        return { message: 'OTP resent successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            return { message: 'If that email exists, an OTP has been sent.' };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.passwordResetToken.upsert({
            where: { email: dto.email },
            update: {
                otp,
                expiresAt,
            },
            create: {
                email: dto.email,
                otp,
                expiresAt,
            },
        });
        console.log(`[DEV ONLY] Password Reset OTP for ${dto.email} is ${otp}`);
        await this.emailService.sendPasswordResetEmail(dto.email, otp);
        return { message: 'If that email exists, an OTP has been sent.' };
    }
    async resetPassword(dto) {
        const tokenRecord = await this.prisma.passwordResetToken.findUnique({
            where: { email: dto.email },
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid or expired password reset request');
        }
        if (tokenRecord.otp !== dto.otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        if (tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('OTP has expired');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { email: dto.email },
            data: { passwordHash },
        });
        await this.prisma.passwordResetToken.delete({
            where: { email: dto.email },
        });
        return { message: 'Password reset successful. You can now login.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map