import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    // Verify reCAPTCHA token
    // if (process.env.ENVIRONMENT !== 'dev') {
    //   const secretKey = process.env.RECAPTCHA_SECRET_KEY || 'dummy_secret';
    //   try {
    //     const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${dto.recaptchaToken}`, {
    //       method: 'POST',
    //     });
    //     const data = await response.json();
    //     if (!data.success) {
    //       throw new UnauthorizedException('ReCAPTCHA verification failed');
    //     }
    //   } catch (error) {
    //     throw new UnauthorizedException('Failed to verify ReCAPTCHA');
    //   }
    // }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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

  async verifyOtp(dto: VerifyOtpDto) {
    const pending = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email },
    });

    if (!pending) {
      throw new UnauthorizedException('No pending registration found for this email');
    }

    if (pending.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (pending.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.loginUser(user.id, user.email);
  }

  private loginUser(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async resendOtp(dto: { email: string }) {
    const pending = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email },
    });

    if (!pending) {
      throw new UnauthorizedException('No pending registration found for this email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Return a generic message even if the user doesn't exist to prevent email enumeration
      return { message: 'If that email exists, an OTP has been sent.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { email: dto.email },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired password reset request');
    }

    if (tokenRecord.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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
}
