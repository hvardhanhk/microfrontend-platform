'use client';

import { Modal } from '../modal';
import { Button } from '../button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function Dialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', isLoading,
}: DialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
