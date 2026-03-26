import type { NextConfig } from 'next';

/**
 * Host shell config.
 * transpilePackages: required because workspace packages use TypeScript
 *   that hasn't been pre-compiled — Next.js needs to handle the compilation.
 * optimizePackageImports: tree-shakes the UI library so unused components
 *   don't end up in the client bundle.
 *
 * Bundle analysis:
 *   ANALYZE=true npm run build --filter=@platform/host-shell
 */
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  transpilePackages: [
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
  // Security headers — defense-in-depth
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);
