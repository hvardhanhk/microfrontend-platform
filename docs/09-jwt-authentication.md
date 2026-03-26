# JWT Authentication & Security

## Overview

The platform implements a multi-layered authentication system using **HS256 JWT tokens** stored in **HTTP-only secure cookies**. Auth is verified at the edge via Next.js middleware before requests reach the origin server.

## Auth Flow

```
┌──────────┐     POST /api/auth/login      ┌──────────────┐
│  Login    │ ─────────────────────────────▶│  API Route   │
│  Page     │  { email, password }          │  (login)     │
└──────────┘                                └──────┬───────┘
                                                   │
                                            Create JWT (jose)
                                            Set HTTP-only cookie
                                                   │
                                                   ▼
┌──────────┐     window.location.href       ┌──────────────┐
│ Dashboard │ ◀────────────────────────────│  Response     │
│  Page     │                               │  + Cookie     │
└──────┬───┘                                └──────────────┘
       │
       │ Full page navigation
       ▼
┌──────────────┐     Cookie: access_token   ┌──────────────┐
│  Edge        │ ◀──────────────────────── │  Browser      │
│  Middleware   │     Verify JWT            │  Request      │
└──────┬───────┘                            └──────────────┘
       │
       │ Valid? → Allow through
       │ Invalid? → Redirect to /login
       ▼
┌──────────────┐
│  Origin      │
│  Server      │
└──────────────┘
```

## JWT Implementation

### Token Creation

**File:** `packages/auth/src/jwt.ts`

```typescript
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "platform-dev-secret-change-in-production"
);

export async function createToken(
  payload: Record<string, unknown>,
  expiresIn = "1h"
): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("platform")
    .setAudience("platform-mfe")
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}
```

### Token Verification

```typescript
export async function verifyToken(
  token: string
): Promise<jose.JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: "platform",
      audience: "platform-mfe",
    });
    return payload;
  } catch {
    return null;
  }
}
```

### JWT Claims

| Claim  | Value              | Purpose                   |
| ------ | ------------------ | ------------------------- |
| `sub`  | `user_1`           | Subject (user ID)         |
| `email`| User's email       | Identity                  |
| `role` | `customer`         | Authorization level       |
| `iss`  | `platform`         | Issuer verification       |
| `aud`  | `platform-mfe`     | Audience restriction      |
| `iat`  | Unix timestamp     | Issued at                 |
| `exp`  | +1 hour            | Expiration                |

## Cookie Security

**File:** `apps/host-shell/src/app/api/auth/login/route.ts`

```typescript
response.cookies.set("access_token", accessToken, {
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax", // CSRF protection
  maxAge: 3600, // 1 hour
  path: "/",
});
```

| Setting      | Value          | Security Benefit                                |
| ------------ | -------------- | ----------------------------------------------- |
| `httpOnly`   | `true`         | Prevents XSS from stealing tokens               |
| `secure`     | Prod only      | Cookie only sent over HTTPS                     |
| `sameSite`   | `lax`          | Prevents CSRF on non-GET cross-origin requests   |
| `maxAge`     | `3600` (1 hr)  | Token auto-expires                               |

## Edge Middleware Auth Gate

**File:** `apps/host-shell/src/middleware.ts`

```typescript
const protectedPaths = ["/dashboard", "/orders", "/settings"];
const isProtected = protectedPaths.some((p) =>
  request.nextUrl.pathname.startsWith(p)
);

if (isProtected) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}
```

Runs at the **CDN edge** — unauthenticated requests never reach the origin server.

## Auth Status Check

**File:** `apps/host-shell/src/app/api/auth/me/route.ts`

```typescript
export async function GET() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { payload } = await jose.jwtVerify(token, JWT_SECRET, { issuer: "platform" });
  return NextResponse.json({
    authenticated: true,
    user: { id: payload.sub, email: payload.email, role: payload.role },
  });
}
```

The App Shell calls `GET /api/auth/me` on mount to determine navbar state (Sign In vs Avatar).

## Auto Token Refresh

**File:** `packages/auth/src/auth-provider.tsx`

```typescript
// Refresh 5 minutes before expiry
useEffect(() => {
  if (!store.tokens) return;
  const expiresIn = store.tokens.expiresAt - Date.now();
  const refreshAt = Math.max(expiresIn - 5 * 60 * 1000, 0);

  const timer = setTimeout(async () => {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (res.ok) store.refreshTokens(data.tokens);
    else store.logout();
  }, refreshAt);

  return () => clearTimeout(timer);
}, [store.tokens]);
```

## Security Headers

**File:** `apps/host-shell/next.config.ts`

```typescript
headers: [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

## Communication with Other Technologies

| Technology      | How Auth Interacts                                              |
| --------------- | --------------------------------------------------------------- |
| jose (library)  | Creates and verifies HS256 JWTs                                 |
| Next.js Middleware | Reads cookie at edge, redirects unauthenticated                |
| Next.js API Routes | Login/logout/me/refresh handlers                              |
| Zustand         | `useAuthStore` persists auth state in sessionStorage            |
| Event Bus       | `auth:login` and `auth:logout` events notify all MFEs          |
| API Client      | Reads tokens from auth store for Authorization header           |
| App Shell       | Fetches `/api/auth/me` to determine navbar state                |

## Key Files

| File                                           | Purpose                        |
| ---------------------------------------------- | ------------------------------ |
| `packages/auth/src/jwt.ts`                     | JWT create/verify functions     |
| `packages/auth/src/auth-provider.tsx`          | AuthProvider + auto-refresh     |
| `apps/host-shell/src/middleware.ts`            | Edge auth gate                  |
| `apps/host-shell/src/app/api/auth/login/route.ts` | Login API + cookie set      |
| `apps/host-shell/src/app/api/auth/me/route.ts`   | Auth status verification     |
| `apps/host-shell/src/app/api/auth/logout/route.ts` | Logout + cookie delete     |
