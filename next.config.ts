import type {NextConfig} from 'next'
import headers from './lib/headers'
import redirects from './lib/redirects'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  serverExternalPackages: ['exifr'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400
  },
  experimental: {
    appNewScrollHandler: true,
    turbopackRustReactCompiler: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/spotlight',
      '@tabler/icons-react'
    ],
    sri: {
      algorithm: 'sha256'
    }
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  async redirects() {
    return redirects
  },
  async headers() {
    return headers
  }
}

export default nextConfig
