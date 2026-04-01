import type { NextConfig } from 'next';

/**
 * mfe-products zone.
 *
 * basePath: '/products'
 *   All pages in this app are served under /products.
 *   src/app/page.tsx → /products
 *
 * assetPrefix: NEXT_PUBLIC_ASSET_PREFIX
 *   When the host-shell proxies /products/* to this app's deployment, the
 *   HTML it returns contains _next/static/... asset URLs.  Without a prefix
 *   the browser requests those from the main domain (the host), which doesn't
 *   have them.  assetPrefix rewrites them to point at this app's own origin.
 *
 *   Set NEXT_PUBLIC_ASSET_PREFIX=https://mfe-products.vercel.app in the
 *   mfe-products Vercel project settings.  Leave it empty for local dev.
 */
const nextConfig: NextConfig = {
  basePath: '/products',
  // In dev, the host-shell proxies /products → localhost:3001.  The browser
  // resolves /_next/static/... relative to localhost:3000 (the host), which
  // doesn't have those files.  assetPrefix makes Next.js emit absolute URLs
  // pointing at this app's own origin so the browser fetches them correctly.
  //
  // IMPORTANT: In Next.js dev mode, basePath IS applied to _next/static paths,
  // so the dev server serves assets at /products/_next/static/... not /_next/static/...
  // The dev assetPrefix must include the basePath segment to match.
  assetPrefix:
    process.env.NEXT_PUBLIC_ASSET_PREFIX ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/products' : ''),
  transpilePackages: [
    '@platform/shell',
    '@platform/ui',
    '@platform/shared-state',
    '@platform/event-bus',
    '@platform/types',
    '@platform/utils',
  ],
  images: { remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }] },

  // In dev, the browser fetches _next/static assets directly from localhost:3001
  // (cross-origin from localhost:3000).  Add CORS headers so the browser allows it.
  // In production all zones share the same origin via rewrites — no CORS needed.
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
