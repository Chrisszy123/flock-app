import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Church, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { handleApiError } from '@/lib/api';
import { Button, Input } from '@/components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Church className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">GIC Register</h1>
              <p className="text-secondary-400">Church Attendance System</p>
            </div>
          </div>
          
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Welcome to <br />
            <span className="text-gradient">Gateway International</span>
          </h2>
          
          <p className="text-xl text-secondary-300 max-w-md">
            Manage attendance, track training progress, and stay connected with your church community.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-dark-800/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">Easy</div>
              <div className="text-secondary-400">Geofenced check-in</div>
            </div>
            <div className="bg-dark-800/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">Secure</div>
              <div className="text-secondary-400">Role-based access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Church className="w-7 h-7 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">GIC Register</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to your account</h2>
            <p className="text-secondary-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
