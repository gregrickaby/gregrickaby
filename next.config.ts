import type {NextConfig} from 'next'
import headers from './lib/headers'
import redirects from './lib/redirects'

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400
  },
  experimental: {
    cssChunking: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/spotlight',
      '@tabler/icons-react'
    ]
  },
  async redirects() {
    return redirects
  },
  async headers() {
    return headers
  }
}

export default nextConfig
