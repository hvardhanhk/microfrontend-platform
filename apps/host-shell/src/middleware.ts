import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge middleware — runs at the CDN edge before reaching the origin.
 *
 * Responsibilities:
 * 1. Geo-based personalization: sets currency/region headers from edge location
 * 2. Auth gate: redirects unauthenticated users away from protected routes
 * 3. Security headers: rate-limit policy marker
 *
 * Why edge? Auth checks here avoid hitting the origin server for
 * unauthenticated requests — critical for 10M+ user scale where
 * origin load is the primary cost driver.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Geo-based personalization
  // `geo` was removed from NextRequest in Next.js 15; use the header set by
  // Vercel (or other edge providers) instead.
  const country = request.headers.get('x-vercel-ip-country') ?? 'US';
  response.headers.set('x-geo-country', country);
  const currencyMap: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    JP: 'JPY',
    IN: 'INR',
    DE: 'EUR',
  };
  response.headers.set('x-currency', currencyMap[country] || 'USD');

  // 2. Protected route check
  const protectedPaths = ['/dashboard', '/orders', '/settings'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Rate limiting header (actual limiting at CDN/API gateway)
  response.headers.set('X-RateLimit-Policy', 'standard');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
