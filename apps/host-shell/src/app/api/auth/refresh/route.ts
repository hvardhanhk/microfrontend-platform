import { NextResponse } from 'next/server';

export async function POST() {
  // In production: validate refresh token, issue new access token
  return NextResponse.json({
    data: { message: 'Token refresh endpoint — implement with your auth service' },
  });
}
