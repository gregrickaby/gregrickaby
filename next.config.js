/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.gregrickaby.com'
      }
    ],
    formats: ['image/avif', 'image/webp']
  },
  async redirects() {
    return [
      {
        source: '/feed.xml',
        destination: '/feed',
        permanent: true
      },
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug*',
        destination: '/blog/:slug*',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
