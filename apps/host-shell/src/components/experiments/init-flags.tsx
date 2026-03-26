'use client';

import { useFeatureFlagStore } from '@platform/shared-state';
import { useEffect } from 'react';

/**
 * Initializes feature flags on app mount.
 *
 * In production, this would fetch flags from a service like LaunchDarkly,
 * Unleash, or your own config API. For demo, we hardcode sample flags
 * including an A/B test experiment.
 */
export function InitFeatureFlags() {
  const setFlags = useFeatureFlagStore((s) => s.setFlags);

  useEffect(() => {
    // Simulate fetching from remote config
    const flags = [
      { name: 'new-checkout-flow', enabled: true },
      { name: 'dark-mode-v2', enabled: false },
      { name: 'hero-experiment', enabled: true, variant: 'B' },
      { name: 'checkout-cta', enabled: true, variant: 'A' },
      { name: 'show-recommendations', enabled: true },
    ];

    setFlags(flags);
  }, [setFlags]);

  return null;
}
