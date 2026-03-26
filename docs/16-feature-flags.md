# Feature Flags & A/B Testing

## Overview

The platform includes a **feature flag system** with declarative components for feature gating and A/B test variant rendering. Flags are stored in a Zustand store and can be loaded from any remote config service.

## Architecture

```
App Init
    │
    ▼
InitFeatureFlags component
    │ Loads flags into useFeatureFlagStore
    ▼
┌──────────────────────┐
│ useFeatureFlagStore   │
│ flags: Map<string,    │
│   FeatureFlag>        │
│ isEnabled(name)       │
│ getVariant(name)      │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
FeatureGate    ABTest
Component     Component
```

## Flag Initialization

**File:** `apps/host-shell/src/components/experiments/init-flags.tsx`

```typescript
export function InitFeatureFlags() {
  const setFlags = useFeatureFlagStore((s) => s.setFlags);

  useEffect(() => {
    // In production: fetch from LaunchDarkly, Unleash, or custom API
    const flags = [
      { name: "new-checkout-flow", enabled: true },
      { name: "dark-mode-v2", enabled: false },
      { name: "hero-experiment", enabled: true, variant: "B" },
      { name: "checkout-cta", enabled: true, variant: "A" },
      { name: "show-recommendations", enabled: true },
    ];
    setFlags(flags);
  }, [setFlags]);

  return null; // Render nothing — side-effect only
}
```

Mounted in the provider tree so flags are available before any MFE renders.

## FeatureGate Component

**File:** `apps/host-shell/src/components/experiments/feature-gate.tsx`

```typescript
interface FeatureGateProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  variant?: string; // Optional: match specific variant
}

export function FeatureGate({ flag, children, fallback = null, variant }) {
  const isEnabled = useFeatureFlagStore((s) => s.isEnabled);
  const getVariant = useFeatureFlagStore((s) => s.getVariant);

  if (!isEnabled(flag)) return <>{fallback}</>;
  if (variant && getVariant(flag) !== variant) return <>{fallback}</>;

  return <>{children}</>;
}
```

### Usage

```tsx
{/* Simple on/off gate */}
<FeatureGate flag="new-checkout-flow">
  <NewCheckoutComponent />
</FeatureGate>

{/* Variant-specific gate */}
<FeatureGate flag="hero-experiment" variant="B">
  <HeroVariantB />
</FeatureGate>

{/* With fallback */}
<FeatureGate flag="show-recommendations" fallback={<ClassicLayout />}>
  <RecommendationsPanel />
</FeatureGate>
```

## ABTest Component

**File:** `apps/host-shell/src/components/experiments/ab-test.tsx`

```typescript
interface ABTestProps {
  experiment: string;
  variants: Record<string, ReactNode>;
  fallback: ReactNode;
}

export function ABTest({ experiment, variants, fallback }) {
  const isEnabled = useFeatureFlagStore((s) => s.isEnabled);
  const getVariant = useFeatureFlagStore((s) => s.getVariant);

  const variant = useMemo(() => {
    if (!isEnabled(experiment)) return null;
    return getVariant(experiment) ?? null;
  }, [experiment, isEnabled, getVariant]);

  // Log impression for analytics
  useMemo(() => {
    if (variant) {
      EventBus.publish("notification:show", {
        type: "info",
        message: `[AB] ${experiment}: variant ${variant}`,
      });
    }
  }, [experiment, variant]);

  if (!variant || !variants[variant]) return <>{fallback}</>;
  return <>{variants[variant]}</>;
}
```

### Usage

```tsx
<ABTest
  experiment="checkout-cta"
  variants={{
    A: <Button>Buy Now</Button>,
    B: <Button variant="destructive">Add to Bag</Button>,
  }}
  fallback={<Button>Purchase</Button>}
/>
```

## Flag Store

**File:** `packages/shared-state/src/feature-flag-store.ts`

| Method              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `setFlags(flags[])` | Bulk load flags from config              |
| `setFlag(flag)`     | Update a single flag                     |
| `isEnabled(name)`   | Check if flag is on                      |
| `getVariant(name)`  | Get A/B test variant string              |

**Not persisted** — flags are loaded fresh on each app initialization to ensure consistency with the remote config service.

## Communication with Other Technologies

| Technology     | How Feature Flags Interact                                    |
| -------------- | ------------------------------------------------------------- |
| Zustand        | `useFeatureFlagStore` holds all flags                         |
| Event Bus      | `feature:flag-updated` event on flag changes; ABTest publishes impressions |
| React          | `FeatureGate` and `ABTest` are declarative React components   |
| TypeScript     | `FeatureFlag` type from `@platform/types`                     |

## Key Files

| File                                                    | Purpose                  |
| ------------------------------------------------------- | ------------------------ |
| `apps/host-shell/src/components/experiments/init-flags.tsx`   | Flag initialization |
| `apps/host-shell/src/components/experiments/feature-gate.tsx` | Declarative gate    |
| `apps/host-shell/src/components/experiments/ab-test.tsx`      | A/B test component  |
| `packages/shared-state/src/feature-flag-store.ts`             | Flag store          |
