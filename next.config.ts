import type {NextConfig} from 'next'

/**
 * Next.js configuration.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp']
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig
