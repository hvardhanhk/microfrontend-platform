import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple in-memory sliding window rate limiter for API routes.
 *
 * Limitations:
 * - In-memory: resets on deploy, not shared across instances.
 * - For production at scale, use Redis (e.g., Upstash) or an API gateway.
 *
 * Usage in API routes:
 *   import { rateLimit } from '@/lib/rate-limit';
 *
 *   export async function POST(request: NextRequest) {
 *     const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
 *     if (limited) return limited;
 *     // ... handle request
 *   }
 */

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// Map of IP -> request window
const windows = new Map<string, WindowEntry>();

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of windows) {
    if (entry.resetAt < now) {
      windows.delete(key);
    }
  }
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { limit: 60, windowMs: 60_000 },
): NextResponse | null {
  cleanup();

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = windows.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    windows.set(key, entry);
  }

  entry.count++;

  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString(),
        requestId: '',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetAt),
        },
      },
    );
  }

  return null;
}
