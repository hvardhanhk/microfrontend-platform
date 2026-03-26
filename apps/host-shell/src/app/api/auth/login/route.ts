import { NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'platform-dev-secret-change-in-production',
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ code: 'INVALID_INPUT', message: 'Email and password required' }, { status: 400 });
    }

    const accessToken = await new jose.SignJWT({ sub: 'user_1', email, role: 'customer' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('platform')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      data: {
        user: {
          id: 'user_1', email, name: 'Alex Johnson', role: 'customer',
          preferences: { theme: 'system', language: 'en', currency: 'USD', notifications: true },
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        tokens: { accessToken, refreshToken: 'demo-refresh', expiresAt: Date.now() + 3600000 },
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ code: 'SERVER_ERROR', message: 'Internal server error' }, { status: 500 });
  }
}
