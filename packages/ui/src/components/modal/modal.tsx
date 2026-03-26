'use client';

import { cn } from '@platform/utils';
import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Accessible modal with focus trap, Escape to close, and overlay click to close.
 * Uses the native <dialog> element for built-in accessibility semantics.
 */
export function Modal({ isOpen, onClose, children, className, title, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'w-full rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'dark:bg-gray-900 dark:text-gray-100',
        'animate-fade-in',
        sizeStyles[size],
        className,
      )}
      onClick={handleBackdropClick}
      aria-label={title}
    >
      <div className="p-6">
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        )}
        {children}
      </div>
    </dialog>
  );
}
