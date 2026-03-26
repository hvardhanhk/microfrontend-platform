# Zustand (Shared State Management)

## Overview

**Zustand** provides lightweight, cross-MFE shared state management. Four stores handle auth, cart, theme, and feature flags. Each store is persisted where appropriate and publishes domain events via the Event Bus for loose coupling.

## Why Zustand

| Feature                | Zustand         | Redux           | Context API     |
| ---------------------- | --------------- | --------------- | --------------- |
| Boilerplate            | Minimal         | Heavy           | Moderate        |
| Provider wrapping      | Not required    | Required        | Required        |
| External access        | `getState()`    | `store.getState()` | Not possible |
| Bundle size            | ~1KB            | ~7KB            | 0 (built-in)   |
| Persistence middleware | Built-in        | Requires redux-persist | Manual    |

Zustand stores can be read **outside React components** (e.g., in the API client for token injection), which is critical for the platform architecture.

## Stores

### 1. useAuthStore

**File:** `packages/shared-state/src/auth-store.ts`

| State           | Type          | Purpose                              |
| --------------- | ------------- | ------------------------------------ |
| `user`          | `User | null` | Current authenticated user           |
| `tokens`        | `AuthTokens | null` | JWT access + refresh tokens    |
| `isAuthenticated` | `boolean`  | Derived from token presence          |
| `isLoading`     | `boolean`     | Auth operation in progress           |

**Storage:** `sessionStorage` (tab-scoped — prevents credential leaking on shared devices)

**Events Published:**
- `auth:login` — when user logs in
- `auth:logout` — when user logs out
- `auth:token-refreshed` — when token is silently refreshed

**External Consumer:** `ApiClient` reads tokens via `useAuthStore.getState().tokens` for automatic Authorization header injection.

### 2. useCartStore

**File:** `packages/shared-state/src/cart-store.ts`

| State        | Type       | Purpose                                |
| ------------ | ---------- | -------------------------------------- |
| `cart`       | `Cart`     | Full cart with items, totals, counts   |
| `isLoading`  | `boolean`  | Cart loading                           |
| `isUpdating` | `boolean`  | Item operation in progress             |

**Storage:** `localStorage` (persists across sessions — users expect cart persistence)

**Auto-calculated totals** via `recalculateTotals()`:
```typescript
function recalculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;       // 8% tax
  const shipping = subtotal > 100 ? 0 : 9.99;                 // Free over $100
  return { subtotal, tax, shipping, total, itemCount };
}
```

**Actions:**
- `addItem(item)` — merges quantity if item exists, otherwise appends
- `removeItem(itemId)` — removes item by ID
- `updateItemQuantity(itemId, quantity)` — updates quantity; removes if ≤ 0
- `clearCart()` — resets to empty cart

**Events Published:** `cart:item-added`, `cart:item-removed`, `cart:item-updated`, `cart:cleared`, `cart:count-changed`

**Consumers:**
- Products MFE calls `addItem()`, reads `cart.items` for quantity steppers
- Cart MFE reads full cart state, calls `removeItem()`, `updateItemQuantity()`, `clearCart()`
- App Shell reads `cart.itemCount` for navbar badge

### 3. useThemeStore

**File:** `packages/shared-state/src/theme-store.ts`

| State           | Type               | Purpose                    |
| --------------- | ------------------ | -------------------------- |
| `theme`         | `'light' \| 'dark' \| 'system'` | User's theme preference |
| `resolvedTheme` | `'light' \| 'dark'` | Actual applied theme      |

**Storage:** `localStorage` (key: `platform-theme`)

**DOM Side Effect:** Toggles `dark` class on `document.documentElement` — this activates all Tailwind `dark:` variant classes.

**Events Published:** `theme:changed`

**Consumer:** Dashboard settings page reads `resolvedTheme` for Switch state, calls `setTheme()` on toggle.

### 4. useFeatureFlagStore

**File:** `packages/shared-state/src/feature-flag-store.ts`

| State      | Type                       | Purpose                     |
| ---------- | -------------------------- | --------------------------- |
| `flags`    | `Map<string, FeatureFlag>` | All loaded feature flags    |
| `isLoaded` | `boolean`                  | Whether flags are ready     |

**Storage:** Not persisted (loaded fresh from remote config on each app init)

**Actions:**
- `setFlags(flags)` — bulk load flags
- `isEnabled(name)` — check if flag is on
- `getVariant(name)` — get A/B test variant

**Events Published:** `feature:flag-updated`

**Consumers:** `FeatureGate` and `ABTest` components read flags declaratively.

## Persistence Middleware

```typescript
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      /* ... store definition ... */
    }),
    {
      name: "platform-cart", // localStorage key
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
```

The SSR guard (`typeof window`) prevents errors during server-side rendering.

## Communication with Other Technologies

| Technology   | How Zustand Interacts                                              |
| ------------ | ------------------------------------------------------------------ |
| Event Bus    | Every store mutation publishes domain events                       |
| React        | `useCartStore((s) => s.cart)` — selector-based subscriptions       |
| API Client   | `useAuthStore.getState()` — reads tokens outside React             |
| TypeScript   | Store types inferred from `create<State & Actions>()`              |
| localStorage | Cart + theme persisted via `zustand/middleware/persist`             |
| sessionStorage | Auth persisted per-tab for security                              |

## Key Files

| File                                          | Purpose                    |
| --------------------------------------------- | -------------------------- |
| `packages/shared-state/src/auth-store.ts`     | Auth state + events        |
| `packages/shared-state/src/cart-store.ts`     | Cart state + auto-totals   |
| `packages/shared-state/src/theme-store.ts`    | Theme preference + DOM toggle |
| `packages/shared-state/src/feature-flag-store.ts` | Feature flags + A/B variants |
