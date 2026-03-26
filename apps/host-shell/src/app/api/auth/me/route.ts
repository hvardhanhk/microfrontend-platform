import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'platform-dev-secret-change-in-production',
);

export async function GET() {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, { issuer: 'platform' });
    return NextResponse.json({
      authenticated: true,
      user: { id: payload.sub, email: payload.email, role: payload.role },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
