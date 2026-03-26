import type { ReactNode } from 'react';

import { cn } from '@platform/utils';

export interface NavbarProps {
  logo?: ReactNode;
  actions?: ReactNode;
  onMenuClick?: () => void;
  className?: string;
}

export function Navbar({ logo, actions, onMenuClick, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md',
        'dark:border-gray-800 dark:bg-gray-950/80',
        className,
      )}
    >
      {/* Mobile menu trigger */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className="flex-shrink-0">{logo}</div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      {actions}
    </header>
  );
}
