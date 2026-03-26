import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@platform/ui', '@platform/event-bus', '@platform/types', '@platform/utils'],
};

export default nextConfig;
