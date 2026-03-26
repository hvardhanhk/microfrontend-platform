'use client';

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';

import type { User, AuthTokens, LoginCredentials } from '@platform/types';
import { useAuthStore } from '@platform/shared-state';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider that wraps the Zustand store with API integration.
 * Mount this in the host-shell; child MFEs access auth via useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      store.setLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const { data } = (await response.json()) as {
          data: { user: User; tokens: AuthTokens };
        };
        store.login(data.user, data.tokens);
      } catch (error) {
        store.setLoading(false);
        throw error;
      }
    },
    [store],
  );

  const logout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    store.logout();
  }, [store]);

  // Auto-refresh token 5 minutes before expiry
  useEffect(() => {
    if (!store.tokens) return;

    const expiresIn = store.tokens.expiresAt - Date.now();
    const refreshAt = Math.max(expiresIn - 5 * 60 * 1000, 0);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: store.tokens?.refreshToken }),
          credentials: 'include',
        });
        if (res.ok) {
          const { data } = (await res.json()) as { data: { tokens: AuthTokens } };
          store.refreshTokens(data.tokens);
        } else {
          store.logout();
        }
      } catch {
        store.logout();
      }
    }, refreshAt);

    return () => clearTimeout(timer);
  }, [store, store.tokens]);

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        login,
        logout,
        updateProfile: store.updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
