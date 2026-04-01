'use client';

import { CrossZoneBridge } from '@platform/shell';
import { ThemeProvider, ToastProvider } from '@platform/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { initSentry, initDatadog } from '../lib/observability';

import { InitFeatureFlags } from './experiments/init-flags';

/**
 * Client-side provider tree.
 * Mounted once in the root layout — all MFE pages inherit these providers.
 *
 * Includes:
 * - Theme (dark/light/system)
 * - TanStack Query (API caching)
 * - Toast notifications
 * - Feature flags initialization
 * - Observability bootstrap (Sentry + Datadog)
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );

  // Initialize observability on mount
  useEffect(() => {
    initSentry();
    initDatadog();
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <InitFeatureFlags />
          <CrossZoneBridge />
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
