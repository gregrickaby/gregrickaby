/**
 * Next.js configuration.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gregrickaby.**',
        pathname: '/**'
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/geocities',
        destination: '/geocities/index.html'
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig
