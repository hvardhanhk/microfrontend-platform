import type { NextConfig } from 'next';

/**
 * Host shell — Next.js Multi-Zone entry point.
 *
 * This app owns:  /  /login  /register  /api/*
 *
 * All other top-level routes are forwarded to independent MFE zones via
 * `rewrites`.  The browser always sees the canonical domain; zone switching
 * is transparent and causes a full-page navigation (intentional — each zone
 * is a separate deployment with its own JS bundle).
 *
 * Remote zone URLs are read from env vars so the host never needs rebuilding
 * when an MFE team ships a new version:
 *
 *   NEXT_PUBLIC_MFE_PRODUCTS_URL=https://mfe-products.vercel.app
 *   NEXT_PUBLIC_MFE_CART_URL=https://mfe-cart.vercel.app
 *   NEXT_PUBLIC_MFE_USER_URL=https://mfe-user.vercel.app
 *
 * Local dev defaults point at each app's dev server port.
 *
 * Bundle analysis:
 *   ANALYZE=true npm run build --filter=@platform/host-shell
 */
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@next/bundle-analyzer')({ enabled: true })
    : (config: NextConfig) => config;

const MFE_PRODUCTS_URL = process.env.NEXT_PUBLIC_MFE_PRODUCTS_URL ?? 'http://localhost:3001';
const MFE_CART_URL = process.env.NEXT_PUBLIC_MFE_CART_URL ?? 'http://localhost:3002';
const MFE_USER_URL = process.env.NEXT_PUBLIC_MFE_USER_URL ?? 'http://localhost:3003';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@platform/shell',
    '@platform/ui',
    '@platform/shared-state',
    '@platform/event-bus',
    '@platform/auth',
    '@platform/api-client',
    '@platform/types',
    '@platform/utils',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@platform/ui'],
  },

  // ── Multi-Zone rewrites ──────────────────────────────────────────────────
  // Requests matching these patterns are proxied to the respective MFE app.
  // Next.js rewrites are transparent to the browser — the URL stays on the
  // canonical domain.  :path* captures sub-paths so /products/123 works too.
  async rewrites() {
    return [
      {
        source: '/products/:path*',
        destination: `${MFE_PRODUCTS_URL}/products/:path*`,
      },
      {
        source: '/cart/:path*',
        destination: `${MFE_CART_URL}/cart/:path*`,
      },
      // /cart with no trailing slash
      {
        source: '/cart',
        destination: `${MFE_CART_URL}/cart`,
      },
      {
        source: '/products',
        destination: `${MFE_PRODUCTS_URL}/products`,
      },
      {
        source: '/dashboard/:path*',
        destination: `${MFE_USER_URL}/dashboard/:path*`,
      },
      {
        source: '/dashboard',
        destination: `${MFE_USER_URL}/dashboard`,
      },
    ];
  },

  // Security headers — defense-in-depth
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
