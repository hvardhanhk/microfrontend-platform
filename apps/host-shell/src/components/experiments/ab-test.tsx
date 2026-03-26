'use client';

import { useMemo, type ReactNode } from 'react';

import { useFeatureFlagStore } from '@platform/shared-state';
import { EventBus } from '@platform/event-bus';

interface ABTestProps {
  /** Experiment/flag name */
  experiment: string;
  /** Map of variant name -> component to render */
  variants: Record<string, ReactNode>;
  /** Fallback if no variant is assigned (control group) */
  fallback: ReactNode;
}

/**
 * A/B test component that renders different variants based on the
 * feature flag store. The variant assignment is determined server-side
 * (or at the edge) and loaded into the feature flag store at app init.
 *
 * Usage:
 *   <ABTest
 *     experiment="checkout-cta"
 *     variants={{
 *       A: <Button>Buy Now</Button>,
 *       B: <Button variant="destructive">Add to Bag</Button>,
 *     }}
 *     fallback={<Button>Purchase</Button>}
 *   />
 *
 * Track conversions by publishing events:
 *   EventBus.publish('product:add-to-cart', { productId, quantity: 1 });
 */
export function ABTest({ experiment, variants, fallback }: ABTestProps) {
  const isEnabled = useFeatureFlagStore((s) => s.isEnabled);
  const getVariant = useFeatureFlagStore((s) => s.getVariant);

  const variant = useMemo(() => {
    if (!isEnabled(experiment)) return null;
    return getVariant(experiment) ?? null;
  }, [experiment, isEnabled, getVariant]);

  // Log impression for analytics
  useMemo(() => {
    if (variant) {
      EventBus.publish('notification:show', {
        type: 'info',
        message: `[AB] ${experiment}: variant ${variant}`,
        duration: 2000,
      });
    }
  }, [experiment, variant]);

  if (!variant || !variants[variant]) return <>{fallback}</>;
  return <>{variants[variant]}</>;
}
