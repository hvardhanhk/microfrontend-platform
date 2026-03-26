# React 19

## Overview

**React 19** is the UI library powering all components across the platform. The project leverages React's component model, hooks, context, and the client/server component boundary in Next.js App Router.

## Key React Patterns Used

### Client vs Server Components

```
Server Components (default)          Client Components ('use client')
├── layout.tsx                       ├── app-shell.tsx
├── page.tsx (home)                  ├── providers.tsx
└── page.tsx (product wrapper)       ├── products-mfe.tsx
                                     ├── cart-mfe.tsx
                                     ├── user-mfe.tsx
                                     └── All UI components with state
```

Server components are rendered on the server and send zero JavaScript to the client. Client components are marked with `'use client'` and include interactive behavior.

### Hooks Used

| Hook             | Where Used                         | Purpose                              |
| ---------------- | ---------------------------------- | ------------------------------------ |
| `useState`       | MFE components, App Shell          | Local UI state (search, sort, etc.)  |
| `useEffect`      | Providers, App Shell               | Side effects (auth check, init)      |
| `useCallback`    | Products MFE                       | Stable function references           |
| `useMemo`        | Products MFE, ABTest               | Expensive computations (filtering)   |
| `useRef`         | useEventBus hook                   | Stable handler ref (no re-subscribe) |
| `useContext`      | useTheme, useAuth, useToast        | Consuming provider values            |
| `forwardRef`     | All 20 UI components               | Expose DOM refs to consumers         |

### Context Providers

| Provider        | Package            | Provides                               |
| --------------- | ------------------ | -------------------------------------- |
| `ThemeProvider`  | `@platform/ui`    | theme, resolvedTheme, setTheme         |
| `ToastProvider`  | `@platform/ui`    | showToast function                     |
| `AuthProvider`   | `@platform/auth`  | user, isAuthenticated, login, logout   |
| `QueryProvider`  | `@platform/api-client` | TanStack Query client              |

### Provider Tree Composition

```tsx
// apps/host-shell/src/components/providers.tsx
<ThemeProvider defaultTheme="light">
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <InitFeatureFlags />
      {children}
    </ToastProvider>
  </QueryClientProvider>
</ThemeProvider>
```

### Dynamic Imports (Code Splitting)

```tsx
const ProductsMfe = dynamic(() => import("@/components/mfe/products-mfe"), {
  loading: () => <Spinner />,
});
```

Each MFE is lazily loaded — the browser only downloads the JavaScript for the current page.

### Conditional Rendering Patterns

```tsx
// Three-state auth rendering (null = loading, true = logged in, false = logged out)
{isLoggedIn === null ? (
  <Placeholder />
) : isLoggedIn ? (
  <Avatar />
) : (
  <SignInButton />
)}

// Cart quantity stepper vs Add to Cart button
{cartItem ? (
  <QuantityStepper value={cartItem.quantity} />
) : (
  <Button onClick={addToCart}>Add to Cart</Button>
)}
```

## Communication with Other Technologies

| Technology       | How React Interacts                                            |
| ---------------- | -------------------------------------------------------------- |
| Next.js          | App Router renders server/client components                    |
| TypeScript       | All components and hooks are fully typed                       |
| Zustand          | Stores consumed via `useCartStore((s) => s.cart)` selectors    |
| Event Bus        | `useEventBus` hook integrates with `useEffect` lifecycle       |
| Tailwind CSS     | JSX className props with utility classes                       |
| TanStack Query   | React hooks (`useQuery`, `useMutation`) for data fetching      |
| Storybook        | Stories render components in isolation for documentation       |

## Key Files

| File                                         | Purpose                         |
| -------------------------------------------- | ------------------------------- |
| `apps/host-shell/src/components/providers.tsx` | Provider tree composition     |
| `apps/host-shell/src/components/app-shell.tsx` | Root layout component         |
| `apps/host-shell/src/components/mfe/*.tsx`     | MFE client components         |
| `packages/ui/src/components/*/`                | 20 shared UI components       |
| `packages/ui/src/themes/theme-provider.tsx`    | Theme context provider        |
