import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MFE_PRODUCTS_URL = process.env.NEXT_PUBLIC_MFE_PRODUCTS_URL ?? 'http://localhost:3001';
const MFE_CART_URL = process.env.NEXT_PUBLIC_MFE_CART_URL ?? 'http://localhost:3002';
const MFE_USER_URL = process.env.NEXT_PUBLIC_MFE_USER_URL ?? 'http://localhost:3003';

const ZONES = [
  { name: 'mfe-products', url: `${MFE_PRODUCTS_URL}/products/api/health` },
  { name: 'mfe-cart', url: `${MFE_CART_URL}/cart/api/health` },
  { name: 'mfe-user', url: `${MFE_USER_URL}/dashboard/api/health` },
];

export async function GET() {
  const results = await Promise.allSettled(
    ZONES.map(async (zone) => {
      const res = await fetch(zone.url, {
        signal: AbortSignal.timeout(3000),
        cache: 'no-store',
      });
      return { name: zone.name, status: res.ok ? 'ok' : 'degraded', code: res.status };
    }),
  );

  const zones = results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    return { name: ZONES[i].name, status: 'unreachable', code: 0 };
  });

  const allOk = zones.every((z) => z.status === 'ok');

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', zones, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 207 },
  );
}
