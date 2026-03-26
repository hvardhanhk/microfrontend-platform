import { create } from 'zustand';

import type { FeatureFlag } from '@platform/types';
import { EventBus } from '@platform/event-bus';

interface FeatureFlagState {
  flags: Map<string, FeatureFlag>;
  isLoaded: boolean;
}

interface FeatureFlagActions {
  setFlags: (flags: FeatureFlag[]) => void;
  setFlag: (name: string, enabled: boolean, variant?: string) => void;
  isEnabled: (name: string) => boolean;
  getVariant: (name: string) => string | undefined;
}

/**
 * Feature flag store for runtime feature toggling and A/B testing.
 *
 * Flags can be loaded from a remote config service (LaunchDarkly, Unleash,
 * or a custom endpoint) at app startup. Changes propagate to all MFEs
 * via the event bus so even Module Federation remotes react instantly.
 */
export const useFeatureFlagStore = create<FeatureFlagState & FeatureFlagActions>()(
  (set, get) => ({
    flags: new Map(),
    isLoaded: false,

    setFlags: (flags) => {
      const map = new Map(flags.map((f) => [f.name, f]));
      set({ flags: map, isLoaded: true });
    },

    setFlag: (name, enabled, variant) => {
      const flags = new Map(get().flags);
      flags.set(name, { name, enabled, variant });
      set({ flags });
      EventBus.publish('feature:flag-updated', { name, enabled });
    },

    isEnabled: (name) => {
      return get().flags.get(name)?.enabled ?? false;
    },

    getVariant: (name) => {
      return get().flags.get(name)?.variant;
    },
  }),
);
