'use client';

import { cn } from '@platform/utils';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastItem extends ToastProps {
  id: string;
}

interface ToastContextValue {
  showToast: (toast: ToastProps) => void;
}

const ToastCtx = createContext<ToastContextValue>({ showToast: () => {} });

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-brand-600 text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toast: ToastProps) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration ?? 4000);
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {/* Toast container — fixed at top-right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed right-4 top-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            {...t}
            onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

export function Toast({ type, message, onDismiss }: ToastProps & { onDismiss?: () => void }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-slide-down',
        'min-w-[300px] max-w-md',
        typeStyles[type],
      )}
    >
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
