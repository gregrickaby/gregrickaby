import type {NextConfig} from 'next'
import headers from './lib/headers'
import redirects from './lib/redirects'

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    cssChunking: true
  },
  async redirects() {
    return redirects
  },
  async headers() {
    return headers
  }
}

export default nextConfig
