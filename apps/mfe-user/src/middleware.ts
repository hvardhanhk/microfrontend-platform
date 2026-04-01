import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * mfe-user zone middleware — protects /dashboard from unauthenticated access.
 *
 * This zone has basePath '/dashboard', so all requests arriving here are
 * already under /dashboard.  We check for the access_token HTTP-only cookie
 * that the host-shell sets at POST /api/auth/login.  Cookies are shared across
 * the whole origin, so the cookie is visible here even though this is a
 * separate Next.js app.
 *
 * On redirect: the host-shell owns /login, so we redirect to the root origin.
 * NEXT_PUBLIC_HOST_URL defaults to '' (same origin) which is correct both
 * locally (all zones on the same localhost when accessed via the host proxy)
 * and in production (the canonical domain serves both shell and the rewrite).
 */

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL ?? '';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    const loginUrl = new URL(`${HOST_URL}/login`, request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths in this zone — basePath is '/dashboard' so this covers
  // /dashboard and /dashboard/*  without matching static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
