import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  recaptchaToken: z.string().optional(),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type OtpForm = z.infer<typeof otpSchema>;

export const defaultLoginValues: Partial<LoginForm> = {
  email: '',
  password: '',
};

export const defaultSignupValues: Partial<SignupForm> = {
  name: '',
  email: '',
  password: '',
};

export const defaultOtpValues: Partial<OtpForm> = {
  otp: '',
};

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const defaultForgotPasswordValues: Partial<ForgotPasswordForm> = {
  email: '',
};

export const defaultResetPasswordValues: Partial<ResetPasswordForm> = {
  otp: '',
  newPassword: '',
};
