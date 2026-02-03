import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
    </div>
  );
}

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

