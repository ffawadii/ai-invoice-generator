import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { endpoints } from '../../endpoints';
import { toast } from 'sonner';

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordForm,
  type ResetPasswordForm,
  defaultForgotPasswordValues,
  defaultResetPasswordValues
} from './constant';

import { AuthLayout } from './AuthLayout';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const forgotMutation = useCreateMutation();
  const resetMutation = useCreateMutation();

  const { register: registerForgot, handleSubmit: handleForgotSubmit, formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: defaultForgotPasswordValues
  });

  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors, isSubmitting: isResetSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: defaultResetPasswordValues
  });

  const onForgot = async (data: ForgotPasswordForm) => {
    try {
      const response = await forgotMutation.mutateAsync({ url: endpoints.forgotPassword, data });
      setEmail(data.email);
      setStep(2);
      toast.success(response.message || 'OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request password reset.');
    }
  };

  const onReset = async (data: ResetPasswordForm) => {
    try {
      const response = await resetMutation.mutateAsync({
        url: endpoints.resetPassword,
        data: { email, otp: data.otp, newPassword: data.newPassword }
      });
      toast.success(response.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(20,184,166,0.12)] border border-slate-100 border-t-4 border-t-teal-500 w-full max-w-md relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(20,184,166,0.2)]">

        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-teal-700 mb-2">Reset Password</h2>
            <p className="text-slate-500 text-sm mb-8">Enter your email to receive a verification code.</p>

            <form onSubmit={handleForgotSubmit(onForgot)} className="flex flex-col gap-4">
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerForgot('email')}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Business Email"
                />
                {forgotErrors.email && <span className="text-red-500 text-xs absolute -bottom-4 left-1">{forgotErrors.email.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isForgotSubmitting}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2 relative overflow-hidden group"
              >
                <span className="relative z-10">{isForgotSubmitting ? 'Sending...' : 'Send Reset Code'}</span>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Remembered your password?{' '}
              <Link to="/login" className="text-teal-700 font-semibold hover:underline">
                Sign in.
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create New Password</h2>
            <p className="text-sm text-center text-slate-500 mb-8 px-4">
              Enter the 6-digit code sent to <span className="font-medium text-slate-700">{email}</span> and your new password.
            </p>

            <form onSubmit={handleResetSubmit(onReset)} className="flex flex-col gap-5">
              <div>
                <input
                  {...registerReset('otp')}
                  className="w-full border border-slate-200 rounded-xl p-4 text-center tracking-[0.5em] text-2xl font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="------"
                  maxLength={6}
                />
                {resetErrors.otp && <p className="text-red-500 text-sm mt-2 text-center">{resetErrors.otp.message}</p>}
              </div>

              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerReset('newPassword')}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="New Password"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </div>
                {resetErrors.newPassword && <span className="text-red-500 text-xs absolute -bottom-4 left-1">{resetErrors.newPassword.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isResetSubmitting}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isResetSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                ← Back
              </button>
            </div>
          </>
        )}

      </div>
    </AuthLayout>
  );
}
