'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

import { cn } from '@platform/utils';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, className, align = 'left' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-900',
            'animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => { item.onClick(); setOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
