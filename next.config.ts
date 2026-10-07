import type { NextConfig } from 'next';
import {
  APP_CACHE_VERSION,
  BRAND_ASSETS_CACHE_CONTROL,
  DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL,
} from './src/shared/lib/cacheGovernance';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    proxyClientMaxBodySize: '25mb',
  },
  async headers() {
    return [
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: BRAND_ASSETS_CACHE_CONTROL,
          },
          {
            key: 'X-INDI-App-Version',
            value: APP_CACHE_VERSION,
          },
        ],
      },
      {
        source: '/c/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL,
          },
          {
            key: 'X-INDI-App-Version',
            value: APP_CACHE_VERSION,
          },
        ],
      },
      {
        source: '/cv/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL,
          },
          {
            key: 'X-INDI-App-Version',
            value: APP_CACHE_VERSION,
          },
        ],
      },
      {
        source: '/p/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: DYNAMIC_PUBLIC_ROUTE_CACHE_CONTROL,
          },
          {
            key: 'X-INDI-App-Version',
            value: APP_CACHE_VERSION,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
