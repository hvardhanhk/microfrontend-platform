'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ComponentType } from 'react';

import { useAuth } from './auth-provider';

/**
 * HOC that redirects unauthenticated users to /login.
 * Use on page-level components that require authentication.
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  function WrappedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      );
    }

    if (!isAuthenticated) return null;

    return <Component {...props} />;
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}
