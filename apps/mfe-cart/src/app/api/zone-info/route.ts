import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// The @platform/shell version this zone was built against.
// Bump this when upgrading the shell package.
const SHELL_COMPAT = '^1.0.0';

export function GET() {
  return NextResponse.json(
    {
      zone: 'mfe-cart',
      version: process.env.npm_package_version ?? '1.0.0',
      shellCompatibility: SHELL_COMPAT,
      basePath: '/cart',
      exposedRoutes: ['/cart'],
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? 'unknown',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
