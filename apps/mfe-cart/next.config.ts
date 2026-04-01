import type { NextConfig } from 'next';

/**
 * mfe-cart zone.
 *
 * basePath: '/cart'  →  src/app/page.tsx serves at /cart
 * assetPrefix: Set NEXT_PUBLIC_ASSET_PREFIX=https://mfe-cart.vercel.app in Vercel.
 */
const nextConfig: NextConfig = {
  basePath: '/cart',
  assetPrefix:
    process.env.NEXT_PUBLIC_ASSET_PREFIX ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3002/cart' : ''),
  transpilePackages: [
    '@platform/shell',
    '@platform/ui',
    '@platform/shared-state',
    '@platform/event-bus',
    '@platform/types',
    '@platform/utils',
  ],
  experimental: {
    bundleSizeLimit: 300_000, // 300 kB per chunk — warn in CI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }] },

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
