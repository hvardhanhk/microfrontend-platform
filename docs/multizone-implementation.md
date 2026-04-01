# Next.js Multi-Zone Implementation

This document explains the architectural changes made to migrate this platform from **App Router composition** (iframes / client-rendered wrappers) to **Next.js Multi-Zone** — a first-class Next.js feature where each MFE is a fully independent deployment, and the host shell transparently routes traffic to them via URL rewrites.

---

## Table of Contents

1. [What is Next.js Multi-Zone?](#1-what-is-nextjs-multi-zone)
2. [Repository Layout](#2-repository-layout)
3. [How Routing Works](#3-how-routing-works)
4. [New Package: `@platform/shell`](#4-new-package-platformshell)
5. [Cross-Zone State (Cart)](#5-cross-zone-state-cart)
6. [Cross-Zone Authentication](#6-cross-zone-authentication)
7. [MFE Zone Configuration](#7-mfe-zone-configuration)
8. [mfe-user Middleware](#8-mfe-user-middleware)
9. [Independent CI/CD](#9-independent-cicd)
10. [Local Development](#10-local-development)
11. [Vercel Deployment](#11-vercel-deployment)
12. [Environment Variables Reference](#12-environment-variables-reference)
13. [Trade-offs](#13-trade-offs)

---

## 1. What is Next.js Multi-Zone?

Multi-Zone is Next.js's built-in answer to microfrontend deployments. Each "zone" is a separate Next.js application with its own:

- Git repository (or monorepo workspace)
- `npm run build` / `vercel deploy`
- JS bundle, route tree, and runtime

The **host shell** owns the canonical domain (e.g. `yourapp.vercel.app`) and uses Next.js `rewrites` to transparently proxy specific path prefixes to the correct zone. The browser never sees a different domain — cross-zone navigation feels like a single app.

```
Browser → https://yourapp.vercel.app/products/42
                        │
              host-shell rewrites
                        │
                        ▼
         https://mfe-products.vercel.app/products/42
```

The key difference from Module Federation or iframes is that **zones are page-level, not component-level**. Navigating between zones is a full-page reload (each zone has its own JS bundle). Within a zone, navigation is a client-side SPA transition as normal.

---

## 2. Repository Layout

```
microfrontend-platform/
├── apps/
│   ├── host-shell/          # Canonical domain owner; /  /login  /register  /api/*
│   ├── mfe-products/        # Zone: /products  /products/*
│   ├── mfe-cart/            # Zone: /cart  /cart/*
│   └── mfe-user/            # Zone: /dashboard  /dashboard/*
├── packages/
│   ├── shell/               # NEW — shared AppShell + CrossZoneBridge
│   ├── shared-state/        # Zustand stores (cart, user)
│   ├── event-bus/           # In-memory EventBus (same-tab)
│   ├── ui/                  # Design system components
│   └── ...
└── .github/workflows/ci.yml # Per-app conditional CI jobs
```

Each zone is a completely independent Next.js app that can be built, tested, and deployed without touching any other app.

---

## 3. How Routing Works

### host-shell `next.config.ts` — rewrites

```ts
// apps/host-shell/next.config.ts

const MFE_PRODUCTS_URL = process.env.NEXT_PUBLIC_MFE_PRODUCTS_URL ?? 'http://localhost:3001';
const MFE_CART_URL     = process.env.NEXT_PUBLIC_MFE_CART_URL     ?? 'http://localhost:3002';
const MFE_USER_URL     = process.env.NEXT_PUBLIC_MFE_USER_URL     ?? 'http://localhost:3003';

async rewrites() {
  return [
    { source: '/products',       destination: `${MFE_PRODUCTS_URL}/products`       },
    { source: '/products/:path*', destination: `${MFE_PRODUCTS_URL}/products/:path*` },
    { source: '/cart',           destination: `${MFE_CART_URL}/cart`               },
    { source: '/cart/:path*',    destination: `${MFE_CART_URL}/cart/:path*`        },
    { source: '/dashboard',      destination: `${MFE_USER_URL}/dashboard`          },
    { source: '/dashboard/:path*', destination: `${MFE_USER_URL}/dashboard/:path*` },
  ];
},
```

**How rewrites work:**

- They run on the Next.js server (or Vercel Edge), not in the browser.
- The browser always sees `yourapp.vercel.app` — the destination URL is never exposed.
- Sub-paths are captured with `:path*` so `/products/42?sort=asc` is forwarded correctly.
- The MFE zone URLs come from env vars, so **the host shell never needs a redeploy** when an MFE team ships a new version.

### What the host shell no longer owns

Before multi-zone, `apps/host-shell/src/app/` had:

```
app/
  products/   ← deleted
  cart/       ← deleted
  dashboard/  ← deleted
```

These are now served by their respective zones. The host shell only owns:

```
app/
  page.tsx         # Home page
  login/
  register/
  api/auth/        # JWT auth endpoints
```

---

## 4. New Package: `@platform/shell`

**Location:** `packages/shell/`

This package provides two components consumed by **all four zones** so every page has consistent chrome regardless of which Next.js app is serving it.

### `AppShell`

```
packages/shell/src/app-shell.tsx
```

Renders the Navbar and Sidebar around `{children}`. Key implementation details:

**Cross-zone navigation uses `<a>` tags, not `<Link>`**

`next/link` only does client-side transitions within the same zone. Clicking a `<Link href="/cart">` from the products zone would try to do a client-side push to `/cart` — but `/cart` is served by a different Next.js app with a different JS bundle. The browser would render nothing or 404.

Plain `<a href="/cart">` forces a full-page navigation, which is correct — the browser hits the host-shell, which rewrites to mfe-cart, which serves the full page.

**Active path detection uses `window.location.pathname`**

`usePathname()` from Next.js returns the path _relative to the zone's `basePath`_. Inside mfe-products (basePath `/products`), `usePathname()` returns `/` even when the user is at `/products/42`. This would break sidebar highlighting.

`window.location.pathname` always returns the real browser URL, so active-link detection works correctly across all zones.

**Cart badge is seeded from Zustand then kept live**

```ts
const storeCount = useCartStore((s) => s.cart?.itemCount ?? 0);
const [cartItemCount, setCartItemCount] = useState(storeCount);

// Same-page mutations (e.g. ProductGrid adds an item):
useEventBus('cart:count-changed', ({ count }) => setCartItemCount(count));

// Zone entry (full-page load from localStorage hydration):
useEffect(() => {
  setCartItemCount(storeCount);
}, [storeCount]);
```

**Auth check calls the host-shell API**

```ts
const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL ?? '';

useEffect(() => {
  fetch(`${HOST_URL}/api/auth/me`, { credentials: 'include' })
    .then((res) => setIsLoggedIn(res.ok))
    .catch(() => setIsLoggedIn(false));
}, []);
```

`HOST_URL` defaults to `''` (same origin) which works in both production (all zones are on the same canonical domain via rewrites) and in local dev (all zones are accessed through the host-shell proxy on `localhost:3000`). Set `NEXT_PUBLIC_HOST_URL=http://localhost:3000` only when running an MFE zone in complete isolation without the host proxy.

### `CrossZoneBridge`

```
packages/shell/src/cross-zone-bridge.tsx
```

Keeps cart state synchronized across browser tabs using the Web Storage API.

**Why this is needed:**

The EventBus is an in-memory singleton. After a cross-zone navigation (full-page reload), the old zone's JS context is gone — any events emitted there are lost. Zustand's `persist` middleware solves the _same-tab_ re-entry problem by re-hydrating from `localStorage` automatically. But if a user has **two tabs open** (one on `/products`, one on `/cart`) and adds an item in Tab A, Tab B's cart badge won't update.

**How it works:**

The browser fires a `storage` event on all _other_ tabs/windows whenever any tab writes to `localStorage`. `CrossZoneBridge` listens for writes to the `platform-cart` key (the key Zustand uses), parses the Zustand persist format, and calls `setCart` to update the local store:

```ts
window.addEventListener('storage', (event) => {
  if (event.key !== 'platform-cart' || !event.newValue) return;
  const parsed = JSON.parse(event.newValue);
  // Zustand persist format: { state: { cart: {...} }, version: 0 }
  if (parsed?.state?.cart) setCart(parsed.state.cart);
});
```

`CrossZoneBridge` renders `null` — it is a pure side-effect component. It is mounted once in every zone's root layout so it is always active.

### How zones consume `@platform/shell`

Every zone layout (`apps/*/src/app/layout.tsx`):

```tsx
import { AppShell, CrossZoneBridge } from '@platform/shell';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="light">
          <ToastProvider>
            <CrossZoneBridge /> {/* cross-tab cart sync */}
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Each zone's `next.config.ts` includes `'@platform/shell'` in `transpilePackages` so Next.js compiles the TypeScript source directly (no pre-build step needed for a workspace package).

---

## 5. Cross-Zone State (Cart)

The cart state is managed by Zustand with the `persist` middleware (in `@platform/shared-state`). This is the complete flow:

```
User clicks "Add to Cart" (mfe-products zone)
        │
        ▼
useCartStore.addItem() mutates Zustand state
        │
        ├─→ EventBus.emit('cart:count-changed') → AppShell badge updates immediately
        │
        └─→ Zustand persist writes { state: { cart: {...} } } to localStorage["platform-cart"]
                │
                ├─→ (same tab) Zustand re-hydrates on next full-page load → badge correct
                │
                └─→ (other tabs) browser fires `storage` event
                          │
                          ▼
                   CrossZoneBridge.onStorage()
                          │
                          ▼
                   setCart(parsed.state.cart) → Zustand updated in other tabs
                          │
                          ▼
                   AppShell badge updates in other tabs
```

No server-side state store, no WebSockets, no shared worker — purely leveraging browser APIs that already exist.

---

## 6. Cross-Zone Authentication

Auth uses HTTP-only cookies set by the host-shell at `POST /api/auth/login`.

**Why cookies work across zones:**

HTTP-only cookies are scoped to the **origin** (protocol + hostname + port), not to the Next.js app that set them. All zones on `yourapp.vercel.app` share the same origin, so the `access_token` cookie is automatically sent with every request to any zone — including the mfe-user zone that checks it in middleware.

**Flow:**

```
1. User POSTs credentials to https://yourapp.vercel.app/api/auth/login
   (host-shell route)

2. host-shell sets:
   Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/

3. Browser navigates to /dashboard
   → host-shell rewrites to mfe-user zone
   → mfe-user Edge middleware reads request.cookies.get('access_token')
   → token present → NextResponse.next() → page renders
   → token absent → redirect to /login (back on host-shell)
```

**host-shell middleware was simplified:** It no longer needs to protect `/dashboard` because the mfe-user zone enforces its own auth. `protectedPaths` in `apps/host-shell/src/middleware.ts` is now an empty array.

---

## 7. MFE Zone Configuration

Every MFE zone has two critical Next.js config options:

### `basePath`

Tells Next.js that all pages in this app live under a URL prefix.

| Zone         | `basePath`   | Root page serves at |
| ------------ | ------------ | ------------------- |
| mfe-products | `/products`  | `/products`         |
| mfe-cart     | `/cart`      | `/cart`             |
| mfe-user     | `/dashboard` | `/dashboard`        |

Without `basePath`, the zone's `src/app/page.tsx` would serve at `/` — conflicting with the host shell's home page.

### `assetPrefix`

When the host shell proxies `/products/*` to mfe-products, the HTML returned contains `<script src="/_next/static/chunks/...">` URLs. Without `assetPrefix`, the browser resolves these relative to the host domain (`yourapp.vercel.app`), which doesn't have mfe-products' JS files → 404s, blank page.

`assetPrefix` makes Next.js emit **absolute URLs** pointing at the MFE's own origin:

```html
<!-- Without assetPrefix (broken) -->
<script src="/_next/static/chunks/main.js">  <!-- fetched from host → 404 -->

<!-- With assetPrefix (correct) -->
<script src="https://mfe-products.vercel.app/_next/static/chunks/main.js">
```

Configuration in each MFE:

```ts
// apps/mfe-products/next.config.ts
assetPrefix:
  process.env.NEXT_PUBLIC_ASSET_PREFIX ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''),
```

The dev fallback (`http://localhost:3001`) handles local dev where the proxy is also active. In production, set `NEXT_PUBLIC_ASSET_PREFIX` to the zone's own Vercel URL in the Vercel project settings.

---

## 8. mfe-user Middleware

```
apps/mfe-user/src/middleware.ts
```

This is the most important security addition. Every request to the `/dashboard` zone is intercepted before reaching any page component.

```ts
const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL ?? '';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    // Redirect to login on the host-shell with a ?redirect= param
    // so the user lands back on /dashboard after signing in.
    const loginUrl = new URL(`${HOST_URL}/login`, request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets (no need to auth-check JS/CSS files)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Why mfe-user owns its own auth check:**

In multi-zone, the host-shell's middleware only runs for requests that the host-shell actually handles. Requests rewritten to mfe-user are received directly by mfe-user's server — the host-shell middleware does **not** run on them. Each zone must enforce its own security boundary.

**The `?redirect=` pattern:**

When the middleware redirects to `/login`, it appends `?redirect=/dashboard` to the URL. The login page (on host-shell) reads this param after successful authentication and redirects the user back to their intended destination.

---

## 9. Independent CI/CD

```
.github/workflows/ci.yml
```

### The problem with naive CI

A standard "build everything on every push" approach destroys the independence value of multi-zone. If changing one line in `mfe-user` triggers a 10-minute build of all four apps, teams lose autonomy.

### Solution: `dorny/paths-filter`

A `changes` job runs first and uses `dorny/paths-filter@v3` to diff the actual commit range:

```yaml
changes:
  outputs:
    shared: ${{ steps.filter.outputs.shared }}
    mfe-user: ${{ steps.filter.outputs.mfe-user }}
    # ... one output per app

  steps:
    - uses: dorny/paths-filter@v3
      with:
        filters: |
          shared:
            - 'packages/**'
          mfe-user:
            - 'apps/mfe-user/**'
```

Each downstream job then has a conditional:

```yaml
mfe-user:
  needs: changes
  if: needs.changes.outputs.mfe-user == 'true' || needs.changes.outputs.shared == 'true'
  steps:
    - run: npx turbo lint  --filter=@platform/mfe-user
    - run: npx turbo test  --filter=@platform/mfe-user
    - run: npx turbo build --filter=@platform/mfe-user
```

**Why `shared` also triggers all apps:** The `packages/` directory contains shared libraries (`@platform/ui`, `@platform/shell`, `@platform/shared-state`, etc.). A change to any shared package could break any app, so all apps rebuild when shared code changes. This is intentional and safe.

**Turborepo `--filter`:** The `--filter=@platform/mfe-user` flag limits the Turborepo pipeline to only the target app and its workspace dependencies. It does not build the other three apps.

### Why not `github.event.pull_request.changed_files`?

That property is a **count** (integer), not a list of file paths. Checking `contains(toJSON(changed_files), 'apps/mfe-user/')` always returns false because `toJSON(3)` is `"3"`.

`dorny/paths-filter` reads the actual git diff via the GitHub API and correctly maps file paths to boolean outputs.

---

## 10. Local Development

Run all four zones simultaneously:

```bash
# Terminal 1 — host-shell (also acts as the proxy for all zones)
cd apps/host-shell && npm run dev        # http://localhost:3000

# Terminal 2 — products zone
cd apps/mfe-products && npm run dev      # http://localhost:3001

# Terminal 3 — cart zone
cd apps/mfe-cart && npm run dev          # http://localhost:3002

# Terminal 4 — user zone
cd apps/mfe-user && npm run dev          # http://localhost:3003
```

Access everything through `http://localhost:3000`. The host-shell's dev server rewrites `/products` → `localhost:3001`, `/cart` → `localhost:3002`, `/dashboard` → `localhost:3003`.

Direct zone access (`localhost:3001`) also works because each zone's `assetPrefix` defaults to its own port in development.

### Running a single MFE in isolation

If you want to work on mfe-user without starting the other apps, you can run it standalone. You will need:

```bash
# apps/mfe-user/.env.local
NEXT_PUBLIC_HOST_URL=http://localhost:3000   # for auth API calls
```

Then start the host-shell (for auth endpoints) and mfe-user. Navigation to `/products` or `/cart` will do full-page reloads to the host, which may 404 if those zones aren't running — expected behavior.

### Docker Compose

For a full local production simulation:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

The compose file wires the services together using Docker internal hostnames:

```yaml
# host-shell sees the other zones by service name inside Docker network
NEXT_PUBLIC_MFE_PRODUCTS_URL=http://mfe-products:3000
NEXT_PUBLIC_MFE_CART_URL=http://mfe-cart:3000
NEXT_PUBLIC_MFE_USER_URL=http://mfe-user:3000

# mfe-user needs to redirect to the host for auth
NEXT_PUBLIC_HOST_URL=http://host-shell:3000
```

---

## 11. Vercel Deployment

Each app has its own `vercel.json` that tells Vercel how to build it from the monorepo root:

```json
// apps/mfe-products/vercel.json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npx turbo build --filter=@platform/mfe-products",
  "outputDirectory": "apps/mfe-products/.next"
}
```

### Required environment variables per project

| Project      | Variable                       | Value                                     |
| ------------ | ------------------------------ | ----------------------------------------- |
| host-shell   | `NEXT_PUBLIC_MFE_PRODUCTS_URL` | `https://mfe-products-xxx.vercel.app`     |
| host-shell   | `NEXT_PUBLIC_MFE_CART_URL`     | `https://mfe-cart-xxx.vercel.app`         |
| host-shell   | `NEXT_PUBLIC_MFE_USER_URL`     | `https://mfe-user-xxx.vercel.app`         |
| mfe-products | `NEXT_PUBLIC_ASSET_PREFIX`     | `https://mfe-products-xxx.vercel.app`     |
| mfe-cart     | `NEXT_PUBLIC_ASSET_PREFIX`     | `https://mfe-cart-xxx.vercel.app`         |
| mfe-user     | `NEXT_PUBLIC_ASSET_PREFIX`     | `https://mfe-user-xxx.vercel.app`         |
| mfe-user     | `NEXT_PUBLIC_HOST_URL`         | `https://yourapp.vercel.app` _(optional)_ |

`NEXT_PUBLIC_HOST_URL` for mfe-user can be left empty in production because all zones are behind the same canonical domain — `fetch('/api/auth/me')` resolves correctly against the request origin.

### Independent deploy workflow

Because each zone has its own Vercel project:

1. A team merges a PR touching only `apps/mfe-products/`
2. CI runs only the `mfe-products` job (via `dorny/paths-filter`)
3. Vercel deploys only `mfe-products`
4. The host-shell's rewrite still points at `NEXT_PUBLIC_MFE_PRODUCTS_URL` — no host-shell redeploy needed
5. Users get the new version on next page load to `/products`

---

## 12. Environment Variables Reference

| Variable                       | Used by    | Purpose                                         | Default (local dev)     |
| ------------------------------ | ---------- | ----------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_MFE_PRODUCTS_URL` | host-shell | URL of the mfe-products deployment              | `http://localhost:3001` |
| `NEXT_PUBLIC_MFE_CART_URL`     | host-shell | URL of the mfe-cart deployment                  | `http://localhost:3002` |
| `NEXT_PUBLIC_MFE_USER_URL`     | host-shell | URL of the mfe-user deployment                  | `http://localhost:3003` |
| `NEXT_PUBLIC_ASSET_PREFIX`     | each MFE   | Own Vercel URL so `_next/static` assets resolve | `http://localhost:300x` |
| `NEXT_PUBLIC_HOST_URL`         | mfe-user   | Host-shell URL for auth API + login redirects   | `''` (same origin)      |

---

## 13. Trade-offs

### What you gain

| Benefit                          | Detail                                                                  |
| -------------------------------- | ----------------------------------------------------------------------- |
| True team independence           | Each MFE team deploys without coordinating with others                  |
| Independent build pipelines      | CI only builds what changed                                             |
| App Router + RSC fully supported | No Module Federation limitations — every zone is a standard Next.js app |
| Progressive rollout              | Deploy mfe-products to 10% of traffic while host-shell is at 100%       |
| Fault isolation                  | mfe-cart outage doesn't bring down `/products` or `/dashboard`          |
| Simple mental model              | Each zone is just a Next.js app with a basePath                         |

### What you lose / what to be aware of

| Trade-off                           | Detail                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Cross-zone navigation = full reload | No SPA feel between zones — intentional and architecturally correct                                            |
| No shared React tree                | Cannot pass React context or state via props across zone boundaries                                            |
| `assetPrefix` required in prod      | Easy to forget; results in blank pages if misconfigured                                                        |
| localStorage coupling               | `CrossZoneBridge` couples zones to the Zustand persist key name — a rename requires coordinated deployment     |
| Auth middleware per zone            | Each zone that needs auth must implement its own middleware                                                    |
| `<a>` not `<Link>` discipline       | Developers must remember to use plain `<a>` for cross-zone links — `<Link>` is only for within-zone navigation |
