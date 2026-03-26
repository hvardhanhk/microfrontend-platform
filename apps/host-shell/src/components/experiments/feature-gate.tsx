'use client';

import { useFeatureFlagStore } from '@platform/shared-state';
import type { ReactNode } from 'react';

interface FeatureGateProps {
  /** Feature flag name to check */
  flag: string;
  /** Rendered when flag is enabled (or matches variant) */
  children: ReactNode;
  /** Rendered when flag is disabled */
  fallback?: ReactNode;
  /** If provided, only renders children when the flag's variant matches */
  variant?: string;
}

/**
 * Declarative feature gate component.
 * Wraps content that should only render when a feature flag is enabled.
 *
 * Usage:
 *   <FeatureGate flag="new-checkout-flow">
 *     <NewCheckout />
 *   </FeatureGate>
 *
 *   <FeatureGate flag="hero-experiment" variant="B">
 *     <HeroVariantB />
 *   </FeatureGate>
 */
export function FeatureGate({ flag, children, fallback = null, variant }: FeatureGateProps) {
  const isEnabled = useFeatureFlagStore((s) => s.isEnabled);
  const getVariant = useFeatureFlagStore((s) => s.getVariant);

  if (!isEnabled(flag)) return <>{fallback}</>;
  if (variant && getVariant(flag) !== variant) return <>{fallback}</>;

  return <>{children}</>;
}
