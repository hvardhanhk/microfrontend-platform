# Next.js 15 (App Router)

## Overview

The platform uses **Next.js 15** with the **App Router** as the framework for all four applications. Next.js provides server-side rendering, file-based routing, edge middleware, and API routes.

## Implementation Details

### App Router File Structure

```
apps/host-shell/src/app/
├── layout.tsx          # Root layout (server component)
├── page.tsx            # Home page (server component, SSG)
├── globals.css         # Global styles
├── (auth)/
│   ├── login/page.tsx  # Login page (client component)
│   └── register/page.tsx
├── products/page.tsx   # Products MFE mount point
├── cart/page.tsx       # Cart MFE mount point
├── dashboard/page.tsx  # User MFE mount point (protected)
└── api/auth/
    ├── login/route.ts  # API route: POST /api/auth/login
    ├── logout/route.ts # API route: POST /api/auth/logout
    ├── me/route.ts     # API route: GET /api/auth/me
    └── refresh/route.ts
```

### Server vs Client Components

- **Server Components** (default): `layout.tsx`, `page.tsx` (home, products page wrapper, dashboard page wrapper) — no JavaScript shipped to the browser
- **Client Components** (`'use client'`): MFE components, providers, app shell — interactive components that need React hooks

### Route Groups

The `(auth)` directory uses a **route group** (parentheses) so `/login` and `/register` share a layout without adding a URL segment.

### Dynamic Imports for MFEs

Each MFE is lazily loaded using `next/dynamic` to enable code splitting:

```tsx
// apps/host-shell/src/app/dashboard/page.tsx
import dynamic from "next/dynamic";
import { Spinner } from "@platform/ui";

const UserMfe = dynamic(() => import("@/components/mfe/user-mfe"), {
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <Spinner size="lg" />
    </div>
  ),
});

export const metadata = { title: "Dashboard" };

export default function Dashboard() {
  return <UserMfe />;
}
```

### Next.js Configuration

**File:** `apps/host-shell/next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // Required: compile workspace TypeScript packages
  transpilePackages: [
    "@platform/ui",
    "@platform/shared-state",
    "@platform/event-bus",
    "@platform/auth",
    "@platform/api-client",
    "@platform/types",
    "@platform/utils",
  ],

  // Tree-shake unused UI components from the bundle
  experimental: {
    optimizePackageImports: ["@platform/ui"],
  },

  // Image optimization: AVIF + WebP formats
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};
```

### Edge Middleware

**File:** `apps/host-shell/src/middleware.ts`

Runs at the CDN edge before the request reaches the origin server:

1. **Geo personalization**: Reads `x-vercel-ip-country` header, maps to currency
2. **Auth gate**: Checks `access_token` cookie for protected routes (`/dashboard`, `/orders`, `/settings`)
3. **Rate limit headers**: Sets `X-RateLimit-Policy` header

```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
```

The matcher excludes static assets and API routes from middleware processing.

### API Routes

Next.js Route Handlers serve as the backend API:

| Route                | Method | Purpose                                 |
| -------------------- | ------ | --------------------------------------- |
| `/api/auth/login`    | POST   | Authenticate user, set JWT cookie       |
| `/api/auth/logout`   | POST   | Delete JWT cookie                       |
| `/api/auth/me`       | GET    | Verify JWT, return user data            |
| `/api/auth/refresh`  | POST   | Refresh access token                    |

### Communication with Other Technologies

| Technology     | How Next.js Interacts                                              |
| -------------- | ------------------------------------------------------------------ |
| Tailwind CSS   | Compiled via PostCSS in Next.js build pipeline                     |
| TypeScript     | Compiled by Next.js (SWC compiler), strict mode via tsconfig       |
| Zustand        | Client components import stores directly                           |
| Event Bus      | Client components use `useEventBus` hook                           |
| JWT (jose)     | API routes create/verify tokens, middleware reads cookies           |
| Docker         | Next.js standalone output mode for minimal Docker images           |
| Turborepo      | `turbo build` orchestrates Next.js builds across all apps          |

## Key Files

| File                                        | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `apps/host-shell/next.config.ts`            | Next.js configuration            |
| `apps/host-shell/src/app/layout.tsx`        | Root layout (server component)   |
| `apps/host-shell/src/middleware.ts`          | Edge middleware                  |
| `apps/host-shell/src/app/api/auth/*/route.ts` | API route handlers             |
