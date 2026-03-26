'use client';

import { useState } from 'react';

import { cn } from '@platform/utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' };

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-medium text-brand-700',
        'dark:bg-brand-900 dark:text-brand-300',
        sizeStyles[size],
        className,
      )}
      aria-label={name}
    >
      {src && !imgError ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
