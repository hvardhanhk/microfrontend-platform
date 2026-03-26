'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * TanStack Query provider with production-tuned defaults.
 *
 * - staleTime 60s: avoid re-fetching data that's still fresh
 * - gcTime 5m: keep unused cache for quick back-navigation
 * - retry 1: single retry for transient failures
 * - refetchOnWindowFocus off: prevent surprise refetches
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
