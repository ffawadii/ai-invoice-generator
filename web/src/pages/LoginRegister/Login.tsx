import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateMutation } from '../../hooks/useCreateMutation';
import { endpoints } from '../../endpoints';
import { loginSchema, type LoginForm, defaultLoginValues } from './constant';
import { AuthLayout } from './AuthLayout';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const loginMutation = useCreateMutation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginMutation.mutateAsync({ url: endpoints.login, data });
      localStorage.setItem('token', response.access_token);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 w-full max-w-md relative z-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-slate-500 text-sm mb-8">Sign in to manage your invoices.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              {...register('email')}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              placeholder="Email Address"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.email.message}</span>}
          </div>

          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register('password')}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              placeholder="Password"
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
            {errors.password && <span className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.password.message}</span>}
          </div>

          <div className="flex justify-end mt-2">
            <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-teal-600 font-medium transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2 relative overflow-hidden group"
          >
            <span className="relative z-10">{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </form>

        <div className="mt-8 relative flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with:</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-600 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
