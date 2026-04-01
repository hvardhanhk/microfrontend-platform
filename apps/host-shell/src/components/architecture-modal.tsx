'use client';

import { Modal, Button, Badge } from '@platform/ui';
import { useState } from 'react';

const steps = [
  {
    number: 1,
    title: 'Monorepo Setup with Turborepo',
    tech: ['Turborepo', 'npm Workspaces'],
    description:
      'We structured the entire platform as a monorepo using Turborepo for build orchestration and npm workspaces for dependency management. This lets all apps and packages live in one repository while remaining independently buildable.',
    details: [
      'apps/ contains 4 Next.js applications — the host shell and 3 microfrontends (products, cart, user)',
      'packages/ contains 7 shared libraries — ui, types, event-bus, shared-state, auth, api-client, utils, and config',
      'turbo.json defines the task dependency graph — packages build before apps that consume them',
      'Remote caching (Vercel) avoids rebuilding unchanged packages across CI runs',
    ],
    diagram: `┌─────────────────────────────────────────┐
│              Turborepo                  │
│         (Build Orchestration)           │
├──────────────┬──────────────────────────┤
│    apps/     │      packages/           │
│              │                          │
│ host-shell ──┼── ui (20 components)     │
│ mfe-products │   types (EventMap)       │
│ mfe-cart     │   event-bus (pub/sub)    │
│ mfe-user     │   shared-state (Zustand) │
│              │   auth (JWT + Provider)  │
│              │   api-client (TanStack)  │
│              │   utils (cn, format)     │
│              │   config (eslint, ts)    │
└──────────────┴──────────────────────────┘`,
  },
  {
    number: 2,
    title: 'Next.js Multi-Zone — Independent Deployments',
    tech: ['Next.js Multi-Zone', 'Vercel Rewrites', 'basePath', 'assetPrefix'],
    description:
      "Each MFE is a completely separate Next.js application deployed independently. The host shell owns the canonical domain and uses Next.js rewrites to transparently proxy /products, /cart, and /dashboard to each zone's deployment. The browser always sees one domain — zone switching is a full-page navigation.",
    details: [
      'host-shell rewrites /products → mfe-products, /cart → mfe-cart, /dashboard → mfe-user via next.config.ts rewrites()',
      'Each zone sets basePath (/products, /cart, /dashboard) so its pages serve at the correct URL prefix',
      "assetPrefix points _next/static asset URLs at the zone's own origin — required when HTML is proxied through the host",
      '@platform/shell package provides AppShell + CrossZoneBridge consumed by all 4 zones for consistent chrome',
      'Cross-zone navigation uses plain <a> tags — next/link only does SPA transitions within the same zone',
      'Zone URLs come from NEXT_PUBLIC_MFE_*_URL env vars — host shell never needs a redeploy when an MFE ships',
    ],
    diagram: `  Browser → https://yourapp.com/products/42
                      │
            host-shell rewrites()
                      │
                      ▼
       https://mfe-products.vercel.app/products/42

┌─────────────────────────────────────────────┐
│  host-shell  (owns / /login /api/auth/*)    │
│  rewrites:                                  │
│    /products/* → mfe-products:3001          │
│    /cart/*     → mfe-cart:3002              │
│    /dashboard/*→ mfe-user:3003              │
├──────────┬──────────┬───────────────────────┤
│mfe-products│mfe-cart│mfe-user               │
│basePath:   │basePath:│basePath:              │
│/products   │/cart    │/dashboard             │
│own deploy  │own deploy│own deploy            │
└──────────┴──────────┴───────────────────────┘`,
  },
  {
    number: 3,
    title: 'Cross-MFE Communication via Event Bus',
    tech: ['Custom Event Bus', 'TypeScript EventMap', 'globalThis'],
    description:
      'MFEs need to talk to each other without tight coupling. We built a custom type-safe pub/sub event bus attached to globalThis. When the Products MFE fires "product:add-to-cart", the Cart MFE receives it instantly — even if it mounted later, thanks to event replay.',
    details: [
      'EventBusImpl singleton on globalThis.__PLATFORM_EVENT_BUS__ survives chunk loading boundaries',
      'EventMap interface in @platform/types provides compile-time safety for every event name + payload',
      'Bounded history (50 events per type) enables late-mounting MFEs to replay missed events',
      'useEventBus React hook auto-subscribes on mount, unsubscribes on unmount, supports replayLast option',
      'Error isolation: one failing listener never crashes other subscribers',
    ],
    diagram: `┌──────────┐    product:add-to-cart    ┌──────────┐
│ Products ├───────────────────────────► Cart MFE │
│   MFE    │    (EventBus publish)     │ (subscribe│
└──────────┘                           │  +replay) │
                                       └──────────┘
┌──────────┐    auth:login             ┌──────────┐
│ Auth     ├───────────────────────────► All MFEs  │
│ Provider │    auth:logout            │ (listen)  │
└──────────┘                           └──────────┘

    globalThis.__PLATFORM_EVENT_BUS__
    ├── Set-based listener maps (O(1) lookup)
    ├── Bounded history (50 events/type)
    └── Type-safe via EventMap interface`,
  },
  {
    number: 4,
    title: 'Shared State with Zustand Stores',
    tech: ['Zustand', 'Persist Middleware', 'sessionStorage', 'localStorage'],
    description:
      'Four Zustand stores provide cross-MFE shared state without React Context wrapping overhead. Each store persists to the appropriate storage mechanism and publishes domain events via the event bus for loose coupling between MFEs.',
    details: [
      'useAuthStore — user, tokens, isAuthenticated. Persists to sessionStorage (tab-scoped for security)',
      'useCartStore — items with auto-calculated subtotal, tax (8%), free shipping (>$100). Persists to localStorage',
      'useThemeStore — light/dark/system preference with OS media query detection. Persists to localStorage',
      'useFeatureFlagStore — flags loaded fresh from remote config on app init. Not persisted.',
      'Each store publishes events (auth:login, cart:item-added, theme:changed) so MFEs can react independently',
    ],
    diagram: `┌─────────────────────────────────────────────┐
│             Zustand Stores                  │
├─────────────┬───────────────┬───────────────┤
│ AuthStore   │ CartStore     │ ThemeStore    │
│ (session)   │ (local)       │ (local)       │
│             │               │               │
│ user        │ items[]       │ mode          │
│ tokens      │ subtotal      │ light/dark/   │
│ isAuth      │ tax (8%)      │ system        │
│             │ shipping      │               │
├─────────────┴───────────────┴───────────────┤
│        All stores publish events via        │
│        EventBus for loose coupling          │
└─────────────────────────────────────────────┘`,
  },
  {
    number: 5,
    title: 'JWT Authentication & Edge Middleware',
    tech: ['jose (JWT)', 'Next.js Middleware', 'HTTP-only Cookies'],
    description:
      'Authentication uses HS256 JWTs stored in HTTP-only secure cookies (invisible to JavaScript). Edge middleware intercepts requests to protected routes (/dashboard, /orders, /settings) and verifies the token before the request even reaches the origin server.',
    details: [
      'Login form POSTs to /api/auth/login — backend creates JWT with jose library, sets HTTP-only cookie',
      'Edge middleware (middleware.ts) runs at CDN edge — verifies cookie on protected routes, redirects to /login if missing',
      'AuthProvider wraps the app, checks /api/auth/me on mount, auto-refreshes token 5 minutes before expiry',
      'withAuth HOC provides page-level auth gating with loading spinner and redirect',
      'Security headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, strict Referrer-Policy',
    ],
    diagram: `  Browser                Edge              Origin
    │                      │                  │
    │── GET /dashboard ───►│                  │
    │                      │── Check cookie ──│
    │                      │   (JWT verify)   │
    │                      │                  │
    │   ┌──── Valid? ──────┤                  │
    │   │  Yes: forward    │──────────────────►│
    │   │  No:  redirect   │                  │
    │◄──┘  to /login       │                  │
    │                      │                  │

  Cookie: access_token (httpOnly, secure, sameSite: lax)
  Token:  HS256 JWT (1h expiry, auto-refresh at 55min)`,
  },
  {
    number: 6,
    title: 'UI Component Library & Design System',
    tech: ['React 19', 'Tailwind CSS', 'Storybook', 'Chromatic'],
    description:
      'A shared UI library (@platform/ui) with 20 accessible components ensures visual consistency across all MFEs. Components use forwardRef for ref forwarding, ARIA attributes for accessibility, and cn() (clsx + tailwind-merge) for composable class merging.',
    details: [
      '20 components: Button, Input, Modal, Card, Table, Tabs, Dropdown, Toast, Tooltip, Avatar, Badge, Spinner, Skeleton, Pagination, Form, Navbar, Sidebar, Accordion, Switch, Dialog',
      'Dark mode via class toggle on documentElement, driven by useThemeStore with OS preference detection',
      'Tree-shakeable: sideEffects: false + optimizePackageImports — only used components in the bundle',
      'Storybook 8 for interactive documentation, Chromatic for pixel-level visual regression on every PR',
      'All components use cn() utility — merges clsx conditional classes with tailwind-merge conflict resolution',
    ],
    diagram: `┌─────────────────────────────────────────────┐
│          @platform/ui (20 components)       │
├─────────────────────────────────────────────┤
│  Layout:  Card, Navbar, Sidebar, Modal      │
│  Form:    Button, Input, Switch, Form       │
│  Data:    Table, Tabs, Accordion, Pagination│
│  Feedback:Toast, Tooltip, Badge, Spinner    │
│  Display: Avatar, Skeleton, Dropdown,Dialog │
├─────────────────────────────────────────────┤
│  cn() = clsx + tailwind-merge               │
│  forwardRef + ARIA on every component       │
│  Storybook ──► Chromatic (visual regression)│
└─────────────────────────────────────────────┘`,
  },
  {
    number: 7,
    title: 'Data Fetching with TanStack Query',
    tech: ['TanStack React Query', 'ApiClient Class', 'Stale-While-Revalidate'],
    description:
      'A framework-agnostic ApiClient class handles HTTP communication with automatic token injection, retry with exponential backoff, and AbortSignal timeouts. TanStack React Query wraps this for the UI layer with stale-while-revalidate caching.',
    details: [
      'ApiClient class: automatic Bearer token injection from auth store, 3 retries with exponential backoff (1s, 2s, 4s)',
      'Retry logic skips 4xx errors (client mistakes) and only retries on 5xx (server failures)',
      'Query hooks: useProducts, useProduct, useCart, useAddToCart, useLogin — each with typed responses',
      'Cache strategy: 60s staleTime, 5min garbage collection — users see cached data instantly while refetching',
      'QueryClientProvider in the host shell — all MFEs share the same query cache',
    ],
    diagram: `  Component ──► useProducts() ──► TanStack Query
                                       │
                              ┌────────┴────────┐
                              │  Cache Hit?      │
                              │  Yes: return     │
                              │  stale data +    │
                              │  refetch in bg   │
                              │                  │
                              │  No: ApiClient   │
                              │  .get('/products')│
                              │  + auto token    │
                              │  + retry 3x      │
                              │  + backoff       │
                              └─────────────────┘`,
  },
  {
    number: 8,
    title: 'Feature Flags & A/B Testing',
    tech: ['Zustand', 'FeatureGate Component', 'ABTest Component'],
    description:
      'Declarative feature gating lets us wrap any feature in a FeatureGate component and control rollout without redeploying. The ABTest component renders variant-specific UI and publishes impression events for analytics tracking.',
    details: [
      'useFeatureFlagStore loads flags from remote config on app init (replaceable with LaunchDarkly/Unleash)',
      '<FeatureGate flag="new-checkout"> — conditionally renders children based on flag state',
      '<ABTest experiment="cta" variants={{A: <BuyNow/>, B: <AddToCart/>}} /> — renders variant by assignment',
      'InitFeatureFlags component fetches flags at app startup in the providers wrapper',
      'Impression events published via event bus for analytics correlation',
    ],
    diagram: `  App Init ──► InitFeatureFlags
                    │
                    ▼
            useFeatureFlagStore
            ┌───────────────────┐
            │ flags: {          │
            │   new-checkout: { │
            │     enabled: true,│
            │     variant: 'B'  │
            │   }               │
            │ }                 │
            └───────┬───────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
  <FeatureGate>           <ABTest>
  flag="new-checkout"     experiment="cta"
  Show/hide feature       Render variant A or B`,
  },
  {
    number: 9,
    title: 'Testing Pyramid',
    tech: ['Jest', 'SWC', 'Playwright', 'Chromatic', 'Testing Library'],
    description:
      'A multi-layer testing strategy ensures quality at every level: unit tests for logic, component tests for UI behavior, end-to-end tests for user flows, and visual regression tests for pixel-level accuracy.',
    details: [
      'Jest + @swc/jest: fast TypeScript compilation, jsdom environment, 70% coverage thresholds',
      '@testing-library/react: component tests focusing on user behavior, not implementation details',
      'Playwright: cross-browser E2E tests on Chromium, Firefox, and Mobile Chrome (Pixel 5 viewport)',
      'Chromatic: every Storybook story is screenshotted on PR — diffs flagged for review',
      'Shared jest config in @platform/config/jest/base.js — all packages inherit the same setup',
    ],
    diagram: `          ┌──────────────┐
          │  Chromatic   │  Visual regression
          │  (Storybook) │  on every PR
          ├──────────────┤
          │  Playwright  │  E2E: 3 browsers
          │  (E2E)       │  auth, cart, nav
          ├──────────────┤
          │  Jest + RTL  │  Component tests
          │  (Unit)      │  70% coverage
          └──────────────┘
          Widest base = most unit tests`,
  },
  {
    number: 10,
    title: 'CI/CD — Per-App Conditional Pipelines',
    tech: ['GitHub Actions', 'dorny/paths-filter', 'Turborepo --filter', 'Vercel', 'Docker'],
    description:
      'Each MFE has its own independent CI job that only runs when its files actually changed. dorny/paths-filter diffs the git commit range and sets boolean outputs. Downstream jobs use these to skip unchanged apps entirely — changing one line in mfe-user triggers only the mfe-user pipeline.',
    details: [
      'changes job runs dorny/paths-filter@v3 — diffs the actual git commit range and produces boolean outputs per path group',
      "Each app job has: if: needs.changes.outputs.mfe-user == 'true' || needs.changes.outputs.shared == 'true'",
      'Turborepo --filter=@platform/mfe-user scopes lint/test/build to only that app and its workspace deps',
      'Shared packages (packages/**) trigger all apps — a change to @platform/shell rebuilds all 4 zones',
      'Each zone has its own vercel.json with buildCommand: npx turbo build --filter=@platform/mfe-products',
      'Storybook/Chromatic job only runs when packages/ui/** changes, not on every PR',
    ],
    diagram: `  git push (changed: apps/mfe-user/dashboard.tsx)
                    │
              changes job
              (dorny/paths-filter)
                    │
      ┌─────────────┼──────────────────┐
      │             │                  │
  mfe-user=true  others=false    shared=false
      │             │
      ▼             ▼
  [RUNS]        [SKIPPED]
  turbo lint    host-shell
  turbo test    mfe-products
  turbo build   mfe-cart
  --filter=
  @platform/mfe-user
      │
      ▼
  Vercel deploys
  only mfe-user`,
  },
];

export function ArchitectureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>
      <Button size="lg" variant="secondary" onClick={() => setIsOpen(true)}>
        How We Built This
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="" size="xl">
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How We Implemented Microfrontends
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A step-by-step walkthrough of the architecture, patterns, and technologies
            </p>
          </div>

          {/* Step navigation */}
          <div className="mb-6 flex flex-wrap justify-center gap-1.5">
            {steps.map((step, i) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeStep === i
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {step.number}
              </button>
            ))}
          </div>

          {/* Active step content */}
          {(() => {
            const step = steps[activeStep];
            return (
              <div>
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {step.tech.map((t) => (
                        <Badge key={t} variant="info">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>

                {/* Architecture diagram */}
                <div className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 dark:bg-gray-950">
                  <pre className="text-xs leading-relaxed text-green-400">{step.diagram}</pre>
                </div>

                {/* Implementation details */}
                <div className="mb-6">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    Implementation Details
                  </h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
                    disabled={activeStep === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-400">
                    {activeStep + 1} / {steps.length}
                  </span>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setActiveStep((p) => Math.min(steps.length - 1, p + 1))}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setIsOpen(false)}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>
    </>
  );
}
