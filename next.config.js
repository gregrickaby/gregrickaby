/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.gregrickaby.**'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug*',
        destination: '/blog/:slug*',
        permanent: true
      },
      {
        source: '/blog/:year(\\d{4})/:month(\\d{2})/:slug*',
        destination: '/blog/:slug*',
        permanent: true
      },
      {
        source: '/category/:slug*',
        destination: '/blog/category/:slug*',
        permanent: true
      },
      {
        source: '/tag/:slug*',
        destination: '/blog/tag/:slug*',
        permanent: true
      },
      {
        source: '/genesis-code-snippets',
        destination: '/blog/genesis-code-snippets',
        permanent: true
      },
      {
        source: '/custom-rss-template-wordpress',
        destination: '/blog/custom-rss-template-wordpress',
        permanent: true
      },
      {
        source: '/remove-woocommerce-styles-and-scripts',
        destination: '/blog/remove-woocommerce-styles-and-scripts',
        permanent: true
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['react-icons']
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

module.exports = nextConfig
