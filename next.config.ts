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
}

export default nextConfig
