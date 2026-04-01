import type { NextConfig } from 'next';

/**
 * mfe-user zone.
 *
 * basePath: '/dashboard'  →  src/app/page.tsx serves at /dashboard
 * assetPrefix: Set NEXT_PUBLIC_ASSET_PREFIX=https://mfe-user.vercel.app in Vercel.
 */
const nextConfig: NextConfig = {
  basePath: '/dashboard',
  assetPrefix:
    process.env.NEXT_PUBLIC_ASSET_PREFIX ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3003/dashboard' : ''),
  transpilePackages: [
    '@platform/shell',
    '@platform/ui',
    '@platform/event-bus',
    '@platform/types',
    '@platform/utils',
  ],

  experimental: {
    bundleSizeLimit: 300_000, // 300 kB per chunk — warn in CI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,

  async headers() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' }],
      },
    ];
  },
};

export default nextConfig;
