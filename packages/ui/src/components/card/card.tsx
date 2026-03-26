import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@platform/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

const variantStyles = {
  default: 'border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
  bordered: 'border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900',
  elevated: 'bg-white shadow-lg dark:bg-gray-900',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl', variantStyles[variant], className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 pt-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  ),
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
