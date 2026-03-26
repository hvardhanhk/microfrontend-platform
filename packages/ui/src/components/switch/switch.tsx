'use client';

import { cn } from '@platform/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeConfig = {
  sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-4' },
  md: { track: 'h-6 w-11', thumb: 'h-4 w-4', translate: 'translate-x-5' },
};

export function Switch({ checked, onChange, label, disabled, size = 'md', className }: SwitchProps) {
  const cfg = sizeConfig[size];

  return (
    <label className={cn('inline-flex items-center gap-2', disabled && 'cursor-not-allowed opacity-50', className)}>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors',
          cfg.track,
          checked ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow-sm transition-transform',
            cfg.thumb,
            'mt-[3px] ml-[3px]',
            checked ? cfg.translate : 'translate-x-0',
          )}
        />
      </button>
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}
