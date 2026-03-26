'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@platform/utils';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md',
            'dark:bg-gray-100 dark:text-gray-900',
            'animate-fade-in pointer-events-none',
            positionStyles[position],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
