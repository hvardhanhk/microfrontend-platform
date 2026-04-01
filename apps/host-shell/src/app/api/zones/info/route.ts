import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MFE_PRODUCTS_URL = process.env.NEXT_PUBLIC_MFE_PRODUCTS_URL ?? 'http://localhost:3001';
const MFE_CART_URL = process.env.NEXT_PUBLIC_MFE_CART_URL ?? 'http://localhost:3002';
const MFE_USER_URL = process.env.NEXT_PUBLIC_MFE_USER_URL ?? 'http://localhost:3003';

// Current @platform/shell version shipped by host-shell
const HOST_SHELL_VERSION = '1.0.0';

const ZONES = [
  { name: 'mfe-products', url: `${MFE_PRODUCTS_URL}/products/api/zone-info` },
  { name: 'mfe-cart', url: `${MFE_CART_URL}/cart/api/zone-info` },
  { name: 'mfe-user', url: `${MFE_USER_URL}/dashboard/api/zone-info` },
];

// Simple semver range check — handles ^X.Y.Z ranges only
function satisfiesRange(version: string, range: string): boolean {
  const clean = range.replace(/^\^|^~/, '');
  const [rMajor] = clean.split('.').map(Number);
  const [vMajor] = version.split('.').map(Number);
  if (range.startsWith('^')) return vMajor === rMajor;
  return version === clean;
}

export async function GET() {
  const results = await Promise.allSettled(
    ZONES.map(async (zone) => {
      const res = await fetch(zone.url, {
        signal: AbortSignal.timeout(3000),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
  );

  const zones = results.map((result, i) => {
    if (result.status === 'rejected') {
      return { name: ZONES[i].name, status: 'unreachable', compatible: false };
    }
    const info = result.value as { shellCompatibility: string; version: string; zone: string };
    const compatible = satisfiesRange(HOST_SHELL_VERSION, info.shellCompatibility);
    return {
      ...info,
      compatible,
      status: compatible ? 'ok' : 'incompatible',
      hostShellVersion: HOST_SHELL_VERSION,
    };
  });

  const allCompatible = zones.every((z) => z.compatible);

  return NextResponse.json({
    hostShellVersion: HOST_SHELL_VERSION,
    allCompatible,
    zones,
    timestamp: new Date().toISOString(),
  });
}
