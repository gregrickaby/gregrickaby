import type { NextConfig } from 'next'

import { headers } from './lib/headers'
import { redirects } from './lib/redirects'

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: {
    /*
     * Datadog's browser SDK reads these through `instrumentation-client.ts`,
     * and `env` inlines them at build time. The client token is public by
     * design; the API key stays server-side.
     */
    DD_APPLICATION_ID: process.env.DD_APPLICATION_ID ?? '',
    DD_CLIENT_TOKEN: process.env.DD_CLIENT_TOKEN ?? '',
    DD_SITE: process.env.DD_SITE || 'us5.datadoghq.com',
    DD_SERVICE: process.env.DD_SERVICE || 'gregrickaby',
    DD_ENV: process.env.DD_ENV || 'production',
    DD_VERSION: process.env.DD_VERSION || process.env.SOURCE_COMMIT || '',
  },
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  /*
   * Keeps React's font preloads in the HTML and out of the Link header. When a
   * page revalidates at runtime (the home page, for Goodreads), Next stores the
   * whole Link header with the cached page, including the llms.txt link from
   * lib/headers.ts, and adds it again on every serve, so copies pile up.
   */
  reactMaxHeadersLength: 0,
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
  // Each post's Markdown copy is served by app/md/[slug]/route.ts.
  async rewrites() {
    return [{ source: '/:slug.md', destination: '/md/:slug' }]
  },
}

export default nextConfig
