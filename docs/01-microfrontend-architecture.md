# Microfrontend Architecture

## Overview

This platform implements a **microfrontend (MFE) architecture** where a single user-facing application is composed of multiple independently developed frontend modules. The composition strategy used is **Next.js App Router Composition** within a Turborepo monorepo.

## Composition Strategy

### Why App Router Composition (Not Module Federation)

| Criteria                | App Router Composition | Module Federation      |
| ----------------------- | ---------------------- | ---------------------- |
| SSR Support             | Native (App Router)    | Requires extra config  |
| Type Safety             | Compile-time via mono  | Runtime only           |
| Developer Experience    | Simple imports         | Complex webpack config |
| Tree Shaking            | Automatic              | Manual setup           |
| Independent Deployments | No (shared build)      | Yes                    |

We chose App Router composition for **compile-time type safety** and **SSR-first rendering**, accepting the trade-off of shared deployments.

## Application Structure

```
apps/
├── host-shell/      # Main container — composes all MFEs (port 3000)
├── mfe-products/    # Product catalog MFE (port 3001)
├── mfe-cart/        # Shopping cart MFE (port 3002)
└── mfe-user/        # User dashboard MFE (port 3003)
```

### Host Shell (Port 3000)

The host shell is the **orchestrator**. It provides:

- **Root Layout** (`apps/host-shell/src/app/layout.tsx`): Wraps all pages with providers (theme, query client, toast, feature flags)
- **App Shell** (`apps/host-shell/src/components/app-shell.tsx`): Persistent navbar + sidebar layout
- **MFE Composition**: Each MFE is loaded via `next/dynamic` in its route page:

```tsx
// apps/host-shell/src/app/products/page.tsx
const ProductsMfe = dynamic(() => import('@/components/mfe/products-mfe'), {
  loading: () => <Spinner />,
});
```

- **Edge Middleware** (`apps/host-shell/src/middleware.ts`): Runs at the CDN edge for auth gating, geo personalization, and rate-limit headers

### MFE Communication Flow

```
┌─────────────┐     EventBus      ┌─────────────┐
│  Products   │ ──publish──────▶  │    Cart      │
│    MFE      │  product:add-to   │    MFE       │
└─────────────┘    -cart          └─────────────┘
       │                                 │
       └──── useCartStore (Zustand) ─────┘
                    │
              ┌─────┘
              ▼
       ┌─────────────┐
       │  App Shell   │  ← reads cartItemCount
       │  (Navbar)    │     for badge display
       └─────────────┘
```

Products MFE calls `useCartStore.addItem()` → Zustand updates → Cart MFE re-renders → App Shell badge updates. All in real time, no prop drilling.

### Each MFE Has

- Its own `page.tsx` in the host shell's app directory
- A client component in `apps/host-shell/src/components/mfe/`
- Access to all shared packages (`@platform/*`)
- The ability to publish/subscribe to events via the EventBus
- Read/write access to shared Zustand stores

## Provider Tree

```
<html>
  <body>
    <Providers>                    ← ThemeProvider + QueryClient + ToastProvider
      <InitFeatureFlags />         ← Loads feature flags into Zustand
      <AppShell>                   ← Navbar + Sidebar + auth check
        {children}                 ← MFE page content
      </AppShell>
    </Providers>
  </body>
</html>
```

## Cross-Technology Communication

| From          | To            | Mechanism              | Example                                     |
| ------------- | ------------- | ---------------------- | ------------------------------------------- |
| Products MFE  | Cart MFE      | Zustand store (shared) | `useCartStore.addItem()` updates cart UI    |
| Products MFE  | App Shell     | Zustand store (shared) | `cartItemCount` drives navbar badge         |
| Any MFE       | Any MFE       | EventBus pub/sub       | `auth:logout` triggers all MFEs to clean up |
| Host Shell    | Edge CDN      | Next.js Middleware     | Auth gate runs before origin                |
| Auth Package  | API Routes    | HTTP (fetch + cookies) | `POST /api/auth/login` sets JWT cookie      |
| Feature Flags | UI Components | Zustand + FeatureGate  | Flag check wraps conditional rendering      |

## Key Files

| File                                           | Purpose                    |
| ---------------------------------------------- | -------------------------- |
| `apps/host-shell/src/app/layout.tsx`           | Root layout with providers |
| `apps/host-shell/src/components/app-shell.tsx` | Persistent nav shell       |
| `apps/host-shell/src/components/mfe/*.tsx`     | MFE client components      |
| `apps/host-shell/src/middleware.ts`            | Edge middleware            |
| `apps/host-shell/src/components/providers.tsx` | Client provider tree       |
