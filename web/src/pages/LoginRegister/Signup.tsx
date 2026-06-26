import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { endpoints } from '../../endpoints';
import { toast } from 'sonner';

// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import {
  signupSchema,
  otpSchema,
  type SignupForm,
  type OtpForm,
  defaultSignupValues,
  defaultOtpValues
} from './constant';

import { AuthLayout } from './AuthLayout';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const { executeRecaptcha } = useGoogleReCaptcha();

  const registerMutation = useCreateMutation();
  const verifyMutation = useCreateMutation();
  const resendMutation = useCreateMutation();

  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors, isSubmitting: isSignupSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: defaultSignupValues
  });

  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors, isSubmitting: isOtpSubmitting } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: defaultOtpValues
  });

  const onSignup = async (data: SignupForm) => {
    try {
      // if (!executeRecaptcha) {
      //   toast.error('ReCAPTCHA not ready');
      //   return;
      // }
      // const recaptchaToken = await executeRecaptcha('signup');
      const payload = { ...data, recaptchaToken: "paused" };
      // businessName might be ignored by backend, but we send it anyway
      const response = await registerMutation.mutateAsync({ url: endpoints.register, data: payload });
      setEmail(data.email);
      setStep(2);
      toast.success(response.message || 'OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const onVerifyOtp = async (data: OtpForm) => {
    try {
      const response = await verifyMutation.mutateAsync({
        url: endpoints.verifyOtp,
        data: { email, otp: data.otp }
      });
      localStorage.setItem('token', response.access_token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP verification failed.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendMutation.mutateAsync({
        url: endpoints.resendOtp,
        data: { email }
      });
      toast.success('OTP resent successfully! Please check your email.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(20,184,166,0.12)] border border-slate-100 border-t-4 border-t-teal-500 w-full max-w-md relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(20,184,166,0.2)]">

        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-teal-700 mb-2">Create Your Account</h2>
            <p className="text-slate-500 text-sm mb-8">Start automating your billing for free.</p>

            <form onSubmit={handleSignupSubmit(onSignup)} className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerSignup('name')}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Full Name"
                />
                {signupErrors.name && <span className="text-red-500 text-xs absolute -bottom-4 left-1">{signupErrors.name.message}</span>}
              </div>

              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...registerSignup('email')}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Business Email"
                />
                {signupErrors.email && <span className="text-red-500 text-xs absolute -bottom-4 left-1">{signupErrors.email.message}</span>}
              </div>



              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...registerSignup('password')}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Create Password"
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
                {signupErrors.password && <span className="text-red-500 text-xs absolute -bottom-4 left-1">{signupErrors.password.message}</span>}
              </div>

              {/* Password Strength Bar Example */}
              <div className="flex gap-1 mt-2 mb-2 px-1">
                <div className="h-1 flex-1 bg-teal-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-teal-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-teal-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
              </div>

              <button
                type="submit"
                disabled={isSignupSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2 relative overflow-hidden group"
              >
                <span className="relative z-10">{isSignupSubmitting ? 'Sending...' : 'Get Started'}</span>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
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
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Verify Email</h2>
            <p className="text-sm text-center text-slate-500 mb-8 px-4">
              Enter the 6-digit code sent to <span className="font-medium text-slate-700">{email}</span>
            </p>

            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="flex flex-col gap-5">
              <div>
                <input
                  {...registerOtp('otp')}
                  className="w-full border border-slate-200 rounded-xl p-4 text-center tracking-[0.5em] text-2xl font-mono text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="------"
                  maxLength={6}
                />
                {otpErrors.otp && <p className="text-red-500 text-sm mt-2 text-center">{otpErrors.otp.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isOtpSubmitting}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isOtpSubmitting ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendMutation.isPending}
                className="text-teal-600 font-medium hover:underline disabled:opacity-50"
              >
                {resendMutation.isPending ? 'Resending...' : 'Resend Code'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                ← Back to Sign Up
              </button>
            </div>
          </>
        )}

      </div>
    </AuthLayout>
  );
}
