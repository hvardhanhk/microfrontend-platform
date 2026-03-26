import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { User, AuthTokens, AuthState } from '@platform/types';
import { EventBus } from '@platform/event-bus';

interface AuthActions {
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshTokens: (tokens: AuthTokens) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Global auth store shared across all MFEs.
 *
 * Persists to sessionStorage (not localStorage) so credentials are
 * scoped to the browser tab — important for shared/kiosk devices.
 * Publishes events on state changes so MFEs that don't import the
 * store directly (e.g., loaded via Module Federation) still react.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, tokens) => {
        set({ user, tokens, isAuthenticated: true, isLoading: false });
        EventBus.publish('auth:login', { user });
      },

      logout: () => {
        set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
        EventBus.publish('auth:logout', undefined);
      },

      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partial } });
      },

      refreshTokens: (tokens) => {
        set({ tokens });
        EventBus.publish('auth:token-refreshed', { expiresAt: tokens.expiresAt });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'platform-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
