'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@platform/utils';

export interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}>{children}</div>;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-900 dark:text-white"
      >
        {title}
        <svg
          className={cn('h-4 w-4 text-gray-500 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-4 animate-fade-in">{children}</div>}
    </div>
  );
}
