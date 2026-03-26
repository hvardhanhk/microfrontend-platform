import { cn } from '@platform/utils';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'rectangular' && 'rounded-lg',
        className,
      )}
      style={{ width, height }}
    />
  );
}
