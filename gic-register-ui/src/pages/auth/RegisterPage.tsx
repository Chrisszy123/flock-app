import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone, MapPin, Church, ArrowRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { handleApiError } from '@/lib/api';
import { Button, Input } from '@/components/ui';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log(data);
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone || undefined,
        address: data.address || undefined,
      });
      toast.success('Registration successful! Welcome to GIC.');
      navigate('/dashboard');
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
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
            Join the <br />
            <span className="text-gradient">Community</span>
          </h2>
          
          <p className="text-xl text-secondary-300 max-w-md">
            Create your account and become part of our growing church family.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 text-secondary-300">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-400 font-bold">1</span>
              </div>
              <span>Create your account</span>
            </div>
            <div className="flex items-center gap-4 text-secondary-300">
              <div className="w-8 h-8 rounded-full bg-secondary-700/50 flex items-center justify-center">
                <span className="text-secondary-400 font-bold">2</span>
              </div>
              <span>Check in on Sundays</span>
            </div>
            <div className="flex items-center gap-4 text-secondary-300">
              <div className="w-8 h-8 rounded-full bg-secondary-700/50 flex items-center justify-center">
                <span className="text-secondary-400 font-bold">3</span>
              </div>
              <span>Track your journey</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-secondary-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

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
              hint="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Date of Birth (Optional)"
              type="date"
              leftIcon={<Calendar className="w-5 h-5" />}
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              leftIcon={<Phone className="w-5 h-5" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Address (Optional)"
              type="text"
              placeholder="Your address"
              leftIcon={<MapPin className="w-5 h-5" />}
              error={errors.address?.message}
              {...register('address')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
