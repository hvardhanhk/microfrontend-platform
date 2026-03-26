import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verifyToken } from './jwt';

/**
 * Edge middleware for auth verification.
 * Runs at the edge (Cloudflare/Vercel/AWS CloudFront) before hitting origin.
 */
export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Public paths that don't need auth
  const publicPaths = ['/login', '/register', '/api/auth', '/_next', '/favicon.ico'];
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward user info to downstream routes via headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub || '');
  response.headers.set('x-user-role', (payload.role as string) || '');
  return response;
}
