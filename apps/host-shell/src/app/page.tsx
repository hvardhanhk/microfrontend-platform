import { Button, Card, CardBody, CardHeader, Badge } from '@platform/ui';
import Link from 'next/link';

/**
 * Home page — static, SSG-friendly.
 * Comprehensive showcase of the microfrontend platform's architecture,
 * features, technical implementation, and future roadmap.
 */
export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-8 text-white md:p-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="relative">
          <Badge variant="info" className="mb-4 border-white/20 bg-white/10 text-white">
            Production-Grade Architecture
          </Badge>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
            Enterprise Microfrontend
            <br />
            Platform
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-brand-100">
            A fully composable e-commerce platform demonstrating how independently deployable
            microfrontends communicate, share state, and scale to 10M+ users — built with Next.js
            15, Turborepo, TypeScript, and a custom event-driven architecture.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Browse Products
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                Open Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-brand-200">
            <span>Next.js 15 (App Router)</span>
            <span>TypeScript (Strict)</span>
            <span>Turborepo</span>
            <span>Zustand</span>
            <span>TanStack Query</span>
            <span>Tailwind CSS</span>
            <span>Playwright</span>
          </div>
        </div>
      </section>

      {/* ─── Platform Stats ─── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { value: '4', label: 'Micro Apps', sub: 'Host + 3 remotes' },
          { value: '7', label: 'Shared Packages', sub: 'UI, state, auth, utils' },
          { value: '20', label: 'UI Components', sub: 'Accessible & themed' },
          { value: '100%', label: 'Type-Safe', sub: 'Strict TS + EventMap' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
              <p className="font-medium text-gray-900 dark:text-white">{stat.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ─── Microfrontend Apps ─── */}
      <section>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Microfrontend Applications
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Each app is independently buildable, testable, and deployable — composed at runtime by the
          host shell.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Product Catalog</h3>
                  <p className="text-xs text-gray-500">mfe-products &middot; Port 3001</p>
                </div>
                <Badge variant="info" className="ml-auto">
                  MFE
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full product browsing with real-time search, category filtering, multi-criteria
                sorting (price, rating, newest), and paginated grid layout. Publishes{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                  product:add-to-cart
                </code>{' '}
                events consumed by the Cart MFE via the event bus.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Search', 'Filter', 'Sort', 'Pagination', 'Event Publishing'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm text-brand-600 hover:underline"
              >
                Explore Products →
              </Link>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Shopping Cart</h3>
                  <p className="text-xs text-gray-500">mfe-cart &middot; Port 3002</p>
                </div>
                <Badge variant="success" className="ml-auto">
                  Live Sync
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time cart management with quantity controls, auto-calculated totals (8% tax,
                free shipping above $100). Subscribes to{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                  product:add-to-cart
                </code>{' '}
                events with{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                  replayLast
                </code>{' '}
                for late-mounting components.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {[
                  'Event Subscription',
                  'Quantity Merge',
                  'Auto Totals',
                  'Session Persistence',
                  'Replay',
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href="/cart"
                className="mt-4 inline-block text-sm text-brand-600 hover:underline"
              >
                View Cart →
              </Link>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <svg
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">User Dashboard</h3>
                  <p className="text-xs text-gray-500">mfe-user &middot; Port 3003</p>
                </div>
                <Badge variant="warning" className="ml-auto">
                  Protected
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authenticated user area with profile management, order history, and settings.
                Protected by edge middleware JWT verification. Auth state shared across all MFEs via
                Zustand + EventBus.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['JWT Auth', 'Edge Middleware', 'Profile', 'Order History', 'Settings'].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
              <Link
                href="/dashboard"
                className="mt-4 inline-block text-sm text-brand-600 hover:underline"
              >
                Open Dashboard →
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ─── Technical Architecture Deep Dive ─── */}
      <section>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Technical Architecture
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          How the platform is built — from monorepo structure to production deployment.
        </p>

        {/* Monorepo & Build */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Monorepo & Build Pipeline</h3>
              <Badge variant="info">Turborepo</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The platform uses <strong>Turborepo</strong> for build orchestration across a monorepo
              containing 4 applications and 7 shared packages. The task graph automatically resolves
              dependencies — packages build before the apps that consume them, with full remote
              caching support.
            </p>
            <div className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 dark:bg-gray-950">
              <pre className="overflow-x-auto">{`microfrontend-platform/
├── apps/
│   ├── host-shell/        # Main container (port 3000)
│   ├── mfe-products/      # Product catalog (port 3001)
│   ├── mfe-cart/           # Shopping cart (port 3002)
│   └── mfe-user/           # User dashboard (port 3003)
├── packages/
│   ├── ui/                 # 20 React components + Storybook
│   ├── types/              # Centralized TypeScript definitions
│   ├── event-bus/          # Type-safe pub/sub messaging
│   ├── shared-state/       # Zustand stores (auth, cart, theme, flags)
│   ├── auth/               # JWT + AuthProvider + middleware
│   ├── api-client/         # HTTP client + TanStack Query hooks
│   ├── utils/              # cn(), formatCurrency, logger, web-vitals
│   └── config/             # ESLint, Tailwind, TypeScript, Jest configs
├── infra/
│   ├── docker/             # Multi-stage Dockerfile + docker-compose
│   ├── k8s/                # Deployment, Service, Ingress manifests
│   └── terraform/          # ECR, S3, CloudFront IaC
└── e2e/                    # Playwright tests (Chromium, Firefox, Mobile)`}</pre>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Task Graph</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  build, dev, lint, test, clean — with dependency resolution and parallel execution
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Strict TypeScript
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ES2022 target, isolatedModules, declarationMaps, bundler module resolution
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Code Quality
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ESLint + Prettier, consistent-type-imports, alphabetized imports, 70% coverage
                  thresholds
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Event Bus */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Cross-MFE Event Bus</h3>
              <Badge variant="success">Type-Safe Pub/Sub</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The backbone of cross-microfrontend communication. A singleton{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                EventBusImpl
              </code>{' '}
              attached to{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                globalThis.__PLATFORM_EVENT_BUS__
              </code>{' '}
              survives chunk loading and provides O(1) pub/sub via{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">Set</code>
              -based listener maps.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  EventMap Registry
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compile-time type safety — every event name and payload shape is defined in{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    @platform/types
                  </code>
                  . Events include: auth (login, logout, token-refresh), cart (item-added, removed,
                  updated, cleared), product (add-to-cart, viewed), theme, feature-flags, and
                  notifications.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Bounded History + Replay
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keeps the last 50 events per type — late-mounting MFEs can replay missed events.
                  The{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    useEventBus
                  </code>{' '}
                  React hook supports{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    replayLast: true
                  </code>{' '}
                  and auto-unsubscribes on unmount. Error isolation ensures one failing listener
                  never crashes others.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* State Management */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Shared State Management</h3>
              <Badge variant="info">Zustand + Persist</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Four Zustand stores provide cross-MFE shared state — lightweight, no provider wrapping
              required, and each publishes domain events via the event bus for loose coupling.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  name: 'useAuthStore',
                  storage: 'sessionStorage',
                  detail:
                    'User, tokens, isAuthenticated. Tab-scoped via sessionStorage for security on shared devices. Publishes auth:login, auth:logout, auth:token-refreshed events.',
                },
                {
                  name: 'useCartStore',
                  storage: 'localStorage',
                  detail:
                    'Cart items with auto-calculated subtotal, tax (8%), conditional free shipping (>$100), and item count. Persists across sessions. Publishes cart:* events.',
                },
                {
                  name: 'useThemeStore',
                  storage: 'localStorage',
                  detail:
                    'Theme preference (light/dark/system) with system media query resolution. Toggles dark class on document.documentElement. Publishes theme:changed.',
                },
                {
                  name: 'useFeatureFlagStore',
                  storage: 'Not persisted',
                  detail:
                    'Feature flags loaded fresh from remote config on each app init. Supports A/B testing variants. Publishes feature:flag-updated events.',
                },
              ].map((store) => (
                <div
                  key={store.name}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-semibold text-brand-600">{store.name}</code>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {store.storage}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{store.detail}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Auth System */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Authentication & Security</h3>
              <Badge variant="warning">JWT + Edge</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multi-layered auth using HS256 JWTs stored in HTTP-only secure cookies. Edge
              middleware intercepts requests to protected routes before they reach the origin server
              — critical for reducing origin load at 10M+ user scale.
            </p>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Auth Flow
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  'Login Form',
                  'POST /api/auth/login',
                  'JWT Created (jose)',
                  'HTTP-only Cookie Set',
                  'Zustand Store Updated',
                  'Redirect to /dashboard',
                  'Edge Middleware Verifies',
                  'Auto-refresh 5min Before Expiry',
                ].map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      {step}
                    </span>
                    {i < 7 && <span className="text-gray-400">→</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cookie Security
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  httpOnly, secure (prod), sameSite: lax, 1-hour maxAge — inaccessible to
                  client-side JavaScript
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Protected Routes
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  /dashboard, /orders, /settings — middleware redirects to /login with redirect
                  param preservation
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Security Headers
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  X-Frame-Options: DENY, X-Content-Type-Options: nosniff, strict Referrer-Policy,
                  Permissions-Policy
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* API Layer */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">API Client & Data Fetching</h3>
              <Badge variant="info">TanStack Query</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              A framework-agnostic{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                ApiClient
              </code>{' '}
              class handles HTTP communication with automatic token injection, retry with
              exponential backoff (3 retries: 1s → 2s → 4s), and AbortSignal timeouts. Wrapped by
              TanStack React Query hooks for the UI layer.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Query Hooks
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  useProducts, useProduct, useCart, useAddToCart, useRemoveFromCart,
                  useUpdateCartItem, useLogin, useLogout, useRegister — with stale-while-revalidate
                  caching (60s stale, 5m GC).
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Resilience Patterns
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Exponential backoff on 5xx errors (skips 4xx). Auto token injection from auth
                  store. Structured ApiClientError with status codes. Credentials: include for
                  cross-origin cookies.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* UI Component Library */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">UI Component Library</h3>
              <Badge variant="success">20 Components</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              A shared design system built with forwardRef, ARIA accessibility, CSS variables for
              theming, and{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">cn()</code>{' '}
              utility (clsx + tailwind-merge) for composable class merging. Documented in Storybook
              with Chromatic visual regression testing.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Button',
                'Input',
                'Modal',
                'Card',
                'Table',
                'Tabs',
                'Dropdown',
                'Toast',
                'Tooltip',
                'Avatar',
                'Badge',
                'Spinner',
                'Skeleton',
                'Pagination',
                'Form',
                'Navbar',
                'Sidebar',
                'Accordion',
                'Switch',
                'Dialog',
              ].map((comp) => (
                <span
                  key={comp}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {comp}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Theming</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSS variables + Tailwind dark mode via class toggle. Light/dark/system with OS
                  preference detection.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Accessibility
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ARIA attributes (aria-busy, role, aria-hidden), keyboard navigation, focus
                  management, screen reader support.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Tree-Shakeable
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  sideEffects: false + optimizePackageImports in Next.js config — only used
                  components land in the bundle.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Feature Flags & Experiments */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Feature Flags & A/B Testing</h3>
              <Badge variant="info">Experiments</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Declarative feature gating with variant-aware A/B testing. Flags are loaded into a
              Zustand store at app initialization (replaceable with LaunchDarkly, Unleash, or custom
              API in production).
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  FeatureGate Component
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Declaratively wrap features:{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    {'<FeatureGate flag="new-checkout">'}
                  </code>
                  . Supports optional variant matching and fallback rendering.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  ABTest Component
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Renders variant-specific UI:{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">
                    {'<ABTest experiment="cta" variants={{A: ..., B: ...}} />'}
                  </code>
                  . Publishes impression events for analytics tracking.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Observability */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Observability & Monitoring</h3>
              <Badge variant="warning">Production-Ready</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  name: 'Sentry',
                  detail:
                    'Error tracking with 10% sample rate in prod, source maps, and release tagging',
                },
                {
                  name: 'Datadog RUM',
                  detail:
                    'Real user monitoring with 20% session replay rate, interaction tracking, and long task detection',
                },
                {
                  name: 'Structured Logger',
                  detail:
                    'JSON output in prod (CloudWatch/Datadog), human-readable in dev, namespaced via logger.child()',
                },
                {
                  name: 'Web Vitals',
                  detail:
                    'LCP, CLS, INP reported via sendBeacon — tracks Core Web Vitals for performance budgets',
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{tool.detail}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Testing */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Testing Strategy</h3>
              <Badge variant="success">Multi-Layer</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Unit Tests (Jest + SWC)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Component and utility testing with @swc/jest for fast TypeScript compilation. 70%
                  coverage thresholds on branches, functions, lines, and statements.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  E2E Tests (Playwright)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cross-browser testing on Chromium, Firefox, and Mobile Chrome (Pixel 5). Tests
                  auth flows, product interactions, cart operations, and navigation.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Visual Regression (Chromatic)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Storybook stories pushed to Chromatic on every PR for pixel-level visual diff
                  testing across all 20 UI components.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Infrastructure & Deployment */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Infrastructure & Deployment</h3>
              <Badge variant="info">Cloud-Native</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full CI/CD pipeline from code push to production deployment — containerized with
              Docker, orchestrated with Kubernetes, and provisioned with Terraform.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  CI Pipeline (GitHub Actions)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lint → Format Check → Unit Tests → Turbo Build → Storybook + Chromatic (on PR) →
                  Docker Build Matrix (4 apps) → Push to AWS ECR (on main).
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Docker (Multi-Stage)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  4-stage build: base (alpine) → deps (npm ci) → builder (turbo build) → runner
                  (standalone Next.js). Non-root user (nextjs:1001), minimal image size.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Kubernetes
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  3-replica deployments with resource limits (500m CPU, 512Mi RAM),
                  liveness/readiness probes, TLS-enabled Ingress via NGINX, ClusterIP services.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Terraform IaC
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  4 ECR repositories, S3 bucket (private static assets), CloudFront CDN with HTTPS
                  enforcement, 24h default TTL, S3 backend for state management.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ─── Skills & Technologies ─── */}
      <section>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Skills & Technologies
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          The complete technology stack demonstrated in this platform.
        </p>
        <Card>
          <CardBody>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  category: 'Frontend',
                  skills: [
                    'Next.js 15 (App Router)',
                    'React 19',
                    'TypeScript (Strict)',
                    'Tailwind CSS',
                    'CSS Variables',
                    'Storybook 8',
                  ],
                },
                {
                  category: 'State & Communication',
                  skills: [
                    'Zustand (Persist)',
                    'Custom Event Bus',
                    'TanStack React Query',
                    'EventMap Type System',
                    'Cross-MFE Pub/Sub',
                    'Replay Mechanism',
                  ],
                },
                {
                  category: 'Auth & Security',
                  skills: [
                    'JWT (HS256 / jose)',
                    'HTTP-only Secure Cookies',
                    'Edge Middleware',
                    'Security Headers',
                    'Rate Limiting',
                    'CSRF Protection',
                  ],
                },
                {
                  category: 'Testing',
                  skills: [
                    'Jest + SWC',
                    'Playwright (Multi-Browser)',
                    'Chromatic (Visual Regression)',
                    'Coverage Thresholds',
                    'E2E Auth Flows',
                    'Mobile Viewport Testing',
                  ],
                },
                {
                  category: 'DevOps & Infrastructure',
                  skills: [
                    'Turborepo',
                    'Docker Multi-Stage',
                    'Kubernetes (Deployments)',
                    'Terraform',
                    'GitHub Actions CI/CD',
                    'AWS (ECR, S3, CloudFront)',
                  ],
                },
                {
                  category: 'Architecture Patterns',
                  skills: [
                    'Microfrontend Composition',
                    'Feature Flags / A/B Testing',
                    'Structured Logging',
                    'Web Vitals Reporting',
                    'Observability (Sentry + Datadog)',
                    'Exponential Backoff',
                  ],
                },
              ].map((group) => (
                <div key={group.category}>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {group.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ─── Future Enhancements ─── */}
      <section>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Future Enhancements
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Planned improvements and features for the next iteration of the platform.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Runtime Composition</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Migrate from App Router composition to <strong>Module Federation</strong> (via
                @module-federation/nextjs-mf) for true runtime independence — deploy each MFE
                separately without rebuilding the host shell. Enables independent release cycles and
                team autonomy.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-pink-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Server Components & Streaming</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage React Server Components for zero-JS product pages and{' '}
                <strong>streaming SSR</strong> with Suspense boundaries. Reduce client bundle size
                by 40%+ by moving data fetching and rendering to the server for non-interactive
                content.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Real Database & OAuth</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Replace demo auth with <strong>OAuth 2.0 / OIDC</strong> (Google, GitHub SSO) backed
                by PostgreSQL + Prisma ORM. Add refresh token rotation, PKCE flow, and multi-device
                session management with Redis-backed session storage.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-orange-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Distributed Tracing</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Implement <strong>OpenTelemetry</strong> for end-to-end distributed tracing across
                all MFEs and API routes. Correlate frontend interactions with backend spans to
                identify performance bottlenecks across the entire request lifecycle.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Edge Caching & ISR</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add <strong>Incremental Static Regeneration</strong> for product detail pages —
                serve statically at the edge with on-demand revalidation. Combine with Redis-backed
                API caching and CDN cache tags for surgical cache invalidation at scale.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-red-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Micro-Frontend SDK</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build a <strong>platform SDK</strong> that provides scaffolding, event bus
                integration, shared state binding, and auth middleware out of the box — allowing new
                teams to spin up a production-ready MFE in minutes with consistent patterns and
                conventions.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-indigo-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Real-Time Features</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add <strong>WebSocket / Server-Sent Events</strong> for real-time inventory updates,
                live order tracking, and collaborative cart sharing. Integrate with the event bus so
                real-time server events seamlessly propagate across all mounted MFEs.
              </p>
            </CardBody>
          </Card>

          <Card className="border-t-4 border-t-teal-500">
            <CardHeader>
              <h3 className="text-lg font-semibold">Internationalization (i18n)</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add <strong>next-intl</strong> for locale-aware routing, message bundles per MFE,
                and dynamic currency/date formatting. Leverage the existing geo-detection middleware
                to auto-select locale and serve region-specific content at the edge.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
