# MFE Production Features

Five production-grade features added to the Multi-Zone platform to address real engineering concerns.

---

## Table of Contents

1. [Feature 1 — Performance Budgets](#1-performance-budgets)
2. [Feature 2 — Error Boundaries & Zone Resilience](#2-error-boundaries--zone-resilience)
3. [Feature 3 — Zone Contract Versioning](#3-zone-contract-versioning)
4. [Feature 4 — Cross-Zone Navigation & 404 Handling](#4-cross-zone-navigation--404-handling)
5. [Feature 5 — Local Dev DX](#5-local-dev-dx)
6. [What's Still Missing](#6-whats-still-missing)

---

## 1. Performance Budgets

**Problem:** Multi-Zone means each zone ships its own full React bundle. Without budgets, bundles silently grow over time and you only notice at the Lighthouse audit stage.

### What was implemented

`experimental.bundleSizeLimit` added to every zone's `next.config.ts`:

| Zone           | Budget           |
| -------------- | ---------------- |
| `host-shell`   | 400 kB per chunk |
| `mfe-products` | 350 kB per chunk |
| `mfe-cart`     | 300 kB per chunk |
| `mfe-user`     | 300 kB per chunk |

Next.js emits a warning during `next build` when any chunk exceeds the limit.

### Bundle analyzer scripts (root `package.json`)

```bash
npm run analyze              # all zones
npm run analyze:shell        # host-shell only
npm run analyze:products     # mfe-products only
```

Opens an interactive treemap of every chunk in the browser via `@next/bundle-analyzer`.

### Files changed

```
apps/host-shell/next.config.ts       — experimental.bundleSizeLimit: 400_000
apps/mfe-products/next.config.ts     — experimental.bundleSizeLimit: 350_000
apps/mfe-cart/next.config.ts         — experimental.bundleSizeLimit: 300_000
apps/mfe-user/next.config.ts         — experimental.bundleSizeLimit: 300_000
package.json                         — analyze / analyze:shell / analyze:products scripts
```

---

## 2. Error Boundaries & Zone Resilience

**Problem:** If mfe-products returns a 500 or is unreachable, the user sees a blank white page or Vercel's generic error page. The platform has no graceful fallback.

### What was implemented

#### Per-zone error and not-found pages

Every zone now has App Router's built-in error boundary and 404 page:

```
apps/mfe-products/src/app/error.tsx       ← "Product catalog unavailable" + retry
apps/mfe-products/src/app/not-found.tsx   ← "Product not found" + browse link
apps/mfe-cart/src/app/error.tsx           ← "Cart unavailable" + retry
apps/mfe-cart/src/app/not-found.tsx
apps/mfe-user/src/app/error.tsx           ← "Dashboard unavailable" + retry
apps/mfe-user/src/app/not-found.tsx
apps/host-shell/src/app/error.tsx         ← Platform-level crash fallback
apps/host-shell/src/app/not-found.tsx     ← Platform-level 404
```

Each `error.tsx` logs `console.error` with a zone prefix (`[mfe-products] zone error: ...`) for easy filtering in log aggregators. Each shows the `error.digest` ID so you can correlate with server logs.

#### Health check API per zone

```
GET /products/api/health   → { zone: "mfe-products", status: "ok", timestamp }
GET /cart/api/health       → { zone: "mfe-cart",     status: "ok", timestamp }
GET /dashboard/api/health  → { zone: "mfe-user",     status: "ok", timestamp }
```

- Edge runtime (runs at CDN edge, not origin)
- `Cache-Control: no-store`
- `Access-Control-Allow-Origin: *` (safe — read-only health data)
- 0 dependencies

#### Host-shell aggregate health endpoint

```
GET /api/zones/health
```

Probes all 3 MFE health endpoints in parallel with a 3-second timeout each:

```json
{
  "status": "degraded",
  "zones": [
    { "name": "mfe-products", "status": "ok", "code": 200 },
    { "name": "mfe-cart", "status": "unreachable", "code": 0 },
    { "name": "mfe-user", "status": "ok", "code": 200 }
  ],
  "timestamp": "2025-04-01T12:00:00.000Z"
}
```

Returns HTTP 200 when all zones are healthy, 207 Multi-Status when any zone is degraded.

**Use this endpoint for:**

- Uptime monitoring (PagerDuty, Datadog synthetics)
- Kubernetes readiness probe on the host-shell pod
- Status page automation

### Files changed

```
apps/mfe-products/src/app/error.tsx
apps/mfe-products/src/app/not-found.tsx
apps/mfe-products/src/app/api/health/route.ts
apps/mfe-cart/src/app/error.tsx
apps/mfe-cart/src/app/not-found.tsx
apps/mfe-cart/src/app/api/health/route.ts
apps/mfe-user/src/app/error.tsx
apps/mfe-user/src/app/not-found.tsx
apps/mfe-user/src/app/api/health/route.ts
apps/host-shell/src/app/error.tsx
apps/host-shell/src/app/not-found.tsx
apps/host-shell/src/app/api/zones/health/route.ts
```

---

## 3. Zone Contract Versioning

**Problem:** `@platform/shell` is a shared package that all 4 zones consume. When the AppShell API changes (e.g. a new required prop), zones that haven't upgraded will silently break at runtime. There's no mechanism to detect this without running all zones together.

### What was implemented

#### Zone-info API per zone

Each zone exposes a machine-readable manifest:

```
GET /products/api/zone-info
GET /cart/api/zone-info
GET /dashboard/api/zone-info
```

Response:

```json
{
  "zone": "mfe-products",
  "version": "1.0.0",
  "shellCompatibility": "^1.0.0",
  "basePath": "/products",
  "exposedRoutes": ["/products", "/products/:id"],
  "buildTime": "2025-04-01T10:00:00.000Z"
}
```

`shellCompatibility` is the semver range of `@platform/shell` that this zone was built and tested against. When you make a breaking change to `@platform/shell`, bump this field in the zones that aren't ready yet — the host-shell will detect the mismatch.

#### Host-shell contract checker

```
GET /api/zones/info
```

Fetches all three zone-info endpoints and checks compatibility:

```json
{
  "hostShellVersion": "1.0.0",
  "allCompatible": false,
  "zones": [
    {
      "zone": "mfe-products",
      "version": "1.0.0",
      "shellCompatibility": "^1.0.0",
      "compatible": true,
      "status": "ok",
      "hostShellVersion": "1.0.0"
    },
    {
      "zone": "mfe-cart",
      "version": "0.9.0",
      "shellCompatibility": "^0.9.0",
      "compatible": false,
      "status": "incompatible",
      "hostShellVersion": "1.0.0"
    }
  ]
}
```

**Workflow for breaking shell changes:**

1. Bump `HOST_SHELL_VERSION` constant in `apps/host-shell/src/app/api/zones/info/route.ts`
2. Call `GET /api/zones/info` in CI — fails if any zone is incompatible
3. Teams update their zone's `shellCompatibility` field and ship their upgrade
4. Once all zones are compatible, CI green

No extra dependencies — semver range check is implemented inline (handles `^X.Y.Z` and `~X.Y.Z` ranges).

### Files changed

```
apps/mfe-products/src/app/api/zone-info/route.ts
apps/mfe-cart/src/app/api/zone-info/route.ts
apps/mfe-user/src/app/api/zone-info/route.ts
apps/host-shell/src/app/api/zones/info/route.ts
```

---

## 4. Cross-Zone Navigation & 404 Handling

**Problem:** `next/router` and `useRouter()` only work within the same zone. Components that need to navigate cross-zone (e.g. "go to cart after add") must use `window.location` directly — but passing query params correctly is error-prone. Also, unmatched routes had no branded fallback.

### What was implemented

#### `useZoneNavigate` hook (`@platform/shell`)

```ts
import { useZoneNavigate } from '@platform/shell';

const navigate = useZoneNavigate();

// Simple cross-zone navigation
navigate('/cart');

// With query params
navigate('/cart', { params: { added: 'prod_1', qty: '2' } });

// Replace instead of push (no back button entry)
navigate('/login', { params: { redirect: '/dashboard' }, replace: true });
```

The hook produces `window.location.href = '/cart?added=prod_1&qty=2'`, which triggers a full-page navigation through the host-shell rewrite → mfe-cart zone. This is the correct and intentional cross-zone navigation pattern.

**Use this instead of:**

- `router.push('/cart')` — silently fails cross-zone (wrong JS context)
- `<Link href="/cart">` — does a client-side transition that 404s cross-zone
- Raw `window.location.href = ...` — no query param safety, repeated boilerplate

#### Platform-level 404 and error pages (host-shell)

When a URL doesn't match any route in any zone:

- `apps/host-shell/src/app/not-found.tsx` — "Page not found" with links to home and products
- `apps/host-shell/src/app/error.tsx` — "Something went wrong" with retry and home links, shows `error.digest`

### Files changed

```
packages/shell/src/use-zone-navigate.ts   — new hook
packages/shell/src/index.ts               — export added
apps/host-shell/src/app/not-found.tsx
apps/host-shell/src/app/error.tsx
```

---

## 5. Local Dev DX

**Problem:** Running `npm run dev` starts all 4 zones simultaneously. Most developers only work on one MFE at a time — starting the others wastes memory and startup time. There was also no quick way to open the bundle analyzer per zone.

### What was implemented

Targeted dev scripts in root `package.json`:

```bash
# Work on home page / auth / shared packages only
npm run dev:shell

# Work on products feature (host-shell proxies /products to localhost:3001)
npm run dev:products

# Work on cart feature
npm run dev:cart

# Work on dashboard / auth feature
npm run dev:user

# Start everything (original behavior)
npm run dev:all
# or
npm run dev

# Bundle analysis
npm run analyze              # all zones
npm run analyze:shell        # host-shell only
npm run analyze:products     # mfe-products only
```

Each `dev:*` script starts host-shell (required for routing and auth endpoints) plus only the target zone. The host-shell rewrites will 502 for the non-running zones — expected behavior when working in isolation.

---

## 6. What's Still Missing

These are real problems you will encounter in production MFE development that are not yet implemented in this platform.

### 6.1 Distributed Tracing across zones

**Problem:** A user action that spans multiple zones (browse products → add to cart → checkout) generates separate server logs in separate Vercel projects. Correlating a bug across zones requires a shared trace ID.

**What's needed:**

- Generate a `X-Trace-Id` header in the host-shell rewrite and forward it to all zones
- Each zone's server logs include the trace ID
- Use OpenTelemetry with a single collector (Datadog, Honeycomb, Grafana Tempo)
- The EventBus events should carry the trace ID in their payload

**Effort:** Medium. The header forwarding is trivial in Next.js middleware. The OTel instrumentation is the bulk of the work.

---

### 6.2 Cross-zone A/B Testing

**Problem:** Feature flags (`useFeatureFlagStore`) are initialized per-zone on page load. If you run an experiment that spans zones (e.g. a new checkout flow that touches products + cart), the user could see variant A in products and variant B in cart — because the flag store re-initializes on every full-page zone transition.

**What's needed:**

- Flag assignments must be stored in a cookie (not just Zustand memory) so they persist across zone transitions
- The host-shell's middleware should set the cookie on first visit with a stable user bucket
- Each zone reads the bucket from the cookie, not from a fresh remote fetch
- Flag evaluation happens server-side in middleware (avoids flicker)

**Effort:** Medium-high. Requires changes to `useFeatureFlagStore`, middleware in host-shell, and a bucketing strategy.

---

### 6.3 Shared Loading State / Zone Transition Feedback

**Problem:** Cross-zone navigation is a full-page reload. There is no loading indicator during the transition — the browser shows a blank page or old content for 200-500ms while the new zone's HTML loads. On slow connections this looks broken.

**What's needed:**

- A `NProgress`-style thin progress bar that starts immediately on `<a>` click (before the page unloads)
- Intercept clicks on cross-zone anchors in AppShell, show a progress bar, then let `window.location` proceed
- The new zone shows the bar completing on `DOMContentLoaded`

**Effort:** Low-medium. The tricky part is coordinating the bar across the page unload/load boundary using `sessionStorage`.

---

### 6.4 Zone-level Rate Limiting & Circuit Breaker

**Problem:** If mfe-products is slow (high latency, not down), the host-shell rewrite will hold open connections waiting for it. At scale this can cascade — the host-shell's connection pool gets exhausted waiting for a slow zone.

**What's needed:**

- Timeout on each rewrite (`NEXT_PUBLIC_MFE_PRODUCTS_URL` requests should have a max latency)
- A circuit breaker: after N consecutive failures, stop forwarding to the zone and serve a static fallback page instead
- This requires edge middleware or a Vercel Edge Config to store circuit state

**Effort:** High. Next.js rewrites don't have built-in timeout configuration. This needs either Vercel Edge Middleware wrapping each rewrite, or an upstream proxy (Cloudflare Worker, nginx) in front of Vercel.

---

### 6.5 Shared Session / SSR Data Fetching

**Problem:** Each zone performs its own `fetch('/api/auth/me')` on mount to check login state. With 4 zones potentially open in tabs, that's redundant auth checks. More importantly: server components in each zone cannot share an auth context because they're in different Next.js apps.

**What's needed:**

- Pass the decoded JWT payload as a request header from the host-shell's rewrite middleware to each zone
- Each zone's server components read from the forwarded header (e.g. `X-User-Id`, `X-User-Email`) rather than making a separate auth call
- This eliminates the client-side auth flash (`isLoggedIn === null`) in AppShell

**Effort:** Medium. Requires adding a middleware step in host-shell that decodes the JWT and injects user headers before forwarding the rewrite.

---

### 6.6 MFE Versioning & Canary Releases

**Problem:** When mfe-products ships a new version, it immediately rolls out to 100% of users. There's no way to do a canary release (10% of traffic to new version) without Vercel Enterprise or a custom edge routing layer.

**What's needed:**

- Multiple Vercel deployments per zone (stable URL + preview URL)
- Host-shell's rewrite target is controlled by an Edge Config key (not a hardcoded env var)
- A traffic splitting layer (Vercel Edge Middleware, Cloudflare, or LaunchDarkly) routes a percentage of users to the new deployment
- The zone-info API (`/api/zone-info`) helps identify which deployment served each request in logs

**Effort:** High without Vercel Enterprise. Medium with it (Edge Config + Traffic Splitting is a first-class feature).

---

### 6.7 Type-safe Cross-zone Event Contracts

**Problem:** The `EventMap` type in `@platform/types` defines event names and payloads, but it's a build-time guarantee only. When zones are deployed independently, a zone that was built against an old `EventMap` and emits a deprecated event payload will silently succeed — the receiving zone just won't understand it.

**What's needed:**

- Event schema versioning: `{ type: 'cart:item-added', version: 2, payload: {...} }`
- Receivers check the `version` field and handle old and new formats during transition windows
- The EventBus logs an error (and possibly drops) events whose version is below the minimum supported

**Effort:** Low-medium. Mostly a convention change in `@platform/types` and `@platform/event-bus`.

---

### 6.8 Micro-Frontend Shell Config Injection

**Problem:** Each MFE has hardcoded config (feature flags URL, API base URL, analytics token). If the config changes, every zone needs a redeploy even though no code changed.

**What's needed:**

- Host-shell serves a `GET /api/config` endpoint returning runtime config as JSON
- Each zone fetches this on startup (or the host-shell injects it as a `<script>` tag in the rewrite response)
- Zones read from `window.__PLATFORM_CONFIG__` instead of `process.env` for runtime-variable config

**Effort:** Low. A JSON endpoint in host-shell + a small initialization step in each zone's layout.

---

### Priority order for a real production system

| Priority    | Feature                         | Why                                                |
| ----------- | ------------------------------- | -------------------------------------------------- |
| 🔴 Critical | 6.5 Shared SSR auth headers     | Eliminates auth flash, reduces latency             |
| 🔴 Critical | 6.1 Distributed tracing         | Can't debug production issues without it           |
| 🟠 High     | 6.2 Cross-zone A/B testing      | Prevents experiment contamination                  |
| 🟠 High     | 6.3 Zone transition loading bar | UX — full-page reloads feel broken otherwise       |
| 🟡 Medium   | 6.7 Event schema versioning     | Prevents silent data corruption on rolling deploys |
| 🟡 Medium   | 6.8 Runtime config injection    | Avoids config-only redeployments                   |
| 🟢 Low      | 6.4 Circuit breaker             | Only needed at significant traffic scale           |
| 🟢 Low      | 6.6 Canary releases             | Needs Vercel Enterprise or custom edge layer       |
