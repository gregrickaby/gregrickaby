/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.gregrickaby.com'
      }
    ],
    formats: ['image/avif', 'image/webp']
  }
}

module.exports = nextConfig
