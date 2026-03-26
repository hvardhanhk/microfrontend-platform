# Observability & Monitoring

## Overview

The platform implements four observability pillars: **error tracking** (Sentry), **real user monitoring** (Datadog RUM), **structured logging**, and **Core Web Vitals** reporting.

## Sentry (Error Tracking)

**File:** `apps/host-shell/src/lib/observability.ts`

```typescript
export function initSentry(config?: Partial<SentryConfig>): void {
  const config = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    environment: process.env.NODE_ENV || "development",
    release: process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  };
  // Placeholder: replace with Sentry.init()
}

export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void;
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error"
): void;
```

| Setting              | Production | Development | Purpose                         |
| -------------------- | ---------- | ----------- | ------------------------------- |
| `tracesSampleRate`   | 0.1 (10%)  | 1.0 (100%)  | Balance cost vs visibility      |
| `environment`        | production | development | Separate dashboards per env     |
| `release`            | App version| 0.0.0       | Correlate errors with deploys   |

## Datadog RUM (Real User Monitoring)

```typescript
export function initDatadog(config?: Partial<DatadogConfig>): void {
  const config = {
    applicationId: process.env.NEXT_PUBLIC_DD_APP_ID,
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
    sessionSampleRate: 100,        // Record 100% of sessions
    sessionReplaySampleRate: 20,   // Replay 20% of sessions
    trackUserInteractions: true,   // Click, scroll, etc.
    trackResources: true,          // API calls, images, scripts
    trackLongTasks: true,          // Tasks > 50ms
  };
}

export function setDatadogUser(user: {
  id: string;
  email?: string;
  name?: string;
}): void;
```

| Metric                  | Rate | Purpose                                |
| ----------------------- | ---- | -------------------------------------- |
| Session sample          | 100% | Full visibility into user behavior     |
| Session replay          | 20%  | Balance storage cost vs debugging need |
| User interactions       | All  | Heatmaps, click maps, rage clicks     |
| Long tasks              | All  | Identify JS bottlenecks                |

## Structured Logger

**File:** `packages/utils/src/logger.ts`

```typescript
class Logger {
  constructor(private service = "platform") {}

  private log(level, message, context?) {
    const entry = { level, message, context, timestamp, service };

    if (process.env.NODE_ENV === "production") {
      // JSON output for CloudWatch/Datadog log ingestion
      console[method](JSON.stringify(entry));
    } else {
      // Human-readable for local development
      console[method](`[${timestamp}] [${level}] [${service}]`, message, context);
    }
  }

  debug(msg, ctx?) {}
  info(msg, ctx?) {}
  warn(msg, ctx?) {}
  error(msg, ctx?) {}

  child(service: string): Logger {
    return new Logger(`${this.service}:${service}`);
  }
}
```

### Usage

```typescript
import { logger } from "@platform/utils";

const authLogger = logger.child("auth");
authLogger.info("User logged in", { userId: "user_1" });
// Production: {"level":"info","message":"User logged in","context":{"userId":"user_1"},"timestamp":"...","service":"platform:auth"}
// Development: [2026-03-26T...] [INFO] [platform:auth] User logged in { userId: 'user_1' }
```

## Core Web Vitals

**File:** `packages/utils/src/web-vitals.ts`

```typescript
export function reportWebVitals(metric: {
  name: string; // LCP, CLS, INP
  value: number;
  id: string;
  rating: string; // 'good', 'needs-improvement', 'poor'
}): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_ANALYTICS_URL,
      JSON.stringify({ ...metric, timestamp: Date.now() })
    );
  }
}
```

| Metric | Target  | Measures                              |
| ------ | ------- | ------------------------------------- |
| LCP    | < 2.5s  | Largest Contentful Paint              |
| CLS    | < 0.1   | Cumulative Layout Shift               |
| INP    | < 200ms | Interaction to Next Paint             |

Uses `navigator.sendBeacon` for reliable delivery even during page unload.

## Rate Limiting

**File:** `apps/host-shell/src/lib/rate-limit.ts`

```typescript
export function rateLimit(
  request: NextRequest,
  config = { limit: 60, windowMs: 60_000 }
): NextResponse | null {
  // Sliding window in-memory limiter
  // Key: IP:pathname
  // Returns 429 with Retry-After header if exceeded
}
```

In-memory sliding window — for production at scale, replace with Redis (Upstash).

## Initialization

**File:** `apps/host-shell/src/components/providers.tsx`

```typescript
export function Providers({ children }) {
  useEffect(() => {
    initSentry();
    initDatadog();
  }, []);
  // ...
}
```

Both are initialized once on app mount in the client-side provider tree.

## Communication with Other Technologies

| Technology     | How Observability Interacts                                   |
| -------------- | ------------------------------------------------------------- |
| Next.js        | Web Vitals reported from Next.js performance hooks            |
| React          | Error boundaries can call `captureException()`                |
| Providers      | `initSentry()` and `initDatadog()` called in provider useEffect |
| API Client     | Failed requests can be logged via structured logger           |
| Rate Limiter   | Returns 429 status with headers for API routes                |

## Key Files

| File                                         | Purpose                     |
| -------------------------------------------- | --------------------------- |
| `apps/host-shell/src/lib/observability.ts`   | Sentry + Datadog setup      |
| `packages/utils/src/logger.ts`               | Structured JSON logger      |
| `packages/utils/src/web-vitals.ts`           | Core Web Vitals reporting   |
| `apps/host-shell/src/lib/rate-limit.ts`      | In-memory rate limiter      |
