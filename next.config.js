/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const config = {
  // Disable type checking and linting during build for landing page deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration (only applied when not using Turbopack)
  ...(process.env.TURBOPACK !== '1' && {
    webpack: (config, { isServer }) => {
      // Fix for Clerk middleware issue with Next.js 15
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          stream: false,
          url: false,
          zlib: false,
          http: false,
          https: false,
          assert: false,
          os: false,
          path: false,
          "node:async_hooks": false,
          "node:events": false,
          "node:fs": false,
          "node:path": false,
          "node:process": false,
          "node:stream": false,
          "node:util": false,
        };
      }
      return config;
    },
  }),

  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'enterprise.cardflux.com',
          },
        ],
        destination: '/enterprise/:path*',
      },
    ];
  },
};

export default config;
