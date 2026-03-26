import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Theme } from '@platform/types';
import { EventBus } from '@platform/event-bus';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      theme: 'light',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        const resolvedTheme = resolveTheme(theme);
        set({ theme, resolvedTheme });
        EventBus.publish('theme:changed', { theme });

        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
        }
      },
    }),
    {
      name: 'platform-theme',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
    },
  ),
);
