import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-secondary-700 rounded-full animate-pulse"></div>
          <Loader2 className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
        <p className="mt-4 text-secondary-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="card-body">
        <div className="h-4 bg-secondary-800 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-secondary-800 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-secondary-800 rounded w-2/3"></div>
      </div>
    </div>
  );
}
