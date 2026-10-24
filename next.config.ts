import type { NextConfig } from 'next'

import { headers } from './lib/headers'
import { redirects } from './lib/redirects'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  // Coolify sets SOURCE_COMMIT. Tabs left open across a deploy reload instead of mixing builds.
  deploymentId: process.env.SOURCE_COMMIT,
  images: {
    formats: ['image/avif', 'image/webp'],
    // 31 days. Cloudflare caches the result too (cache rule on /_next/image).
    minimumCacheTTL: 2678400,
    // Book covers for the home page's "Currently reading" band (lib/goodreads.ts).
    remotePatterns: [new URL('https://i.gr-assets.com/images/**')],
  },
  experimental: {
    agentUpgrade: 'latest',
    // Runs the React Compiler natively instead of through Babel.
    turbopackRustReactCompiler: true,
    turbopackGc: true,
    turbopackLazyDynamicImports: true,
    sri: {
      algorithm: 'sha256',
    },
  },
  async redirects() {
    return redirects
  },
  async headers() {
    return headers
  },
  // The Geocities easter egg is a standalone HTML page in public/geocities.
  // Each post's Markdown copy is served by app/md/[slug]/route.ts.
  async rewrites() {
    return [
      { source: '/geocities', destination: '/geocities/index.html' },
      { source: '/:slug.md', destination: '/md/:slug' },
    ]
  },
}

export default nextConfig
