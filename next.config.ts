import type {NextConfig} from 'next'

/**
 * Next.js configuration.
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gregrickaby.com',
        pathname: '/**'
      }
    ]
  },
  async redirects() {
    return [
      {source: '/feed', destination: '/feed.xml', permanent: true},
      {source: '/rss', destination: '/feed.xml', permanent: true},
      {source: '/rss.xml', destination: '/feed.xml', permanent: true},
      {source: '/blog/feed', destination: '/feed.xml', permanent: true},
      {source: '/feed/atom', destination: '/feed.xml', permanent: true},
      {source: '/xmlrpc.php', destination: '/feed.xml', permanent: true},
      {source: '/blog/xmlrpc.php', destination: '/feed.xml', permanent: true},
      {source: '/wp-:path*', destination: '/', permanent: true},
      {source: '/index.php', destination: '/', permanent: true},
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
      },
      {
        source: '/using-the-golden-ratio-and-rems',
        destination: '/blog/using-the-golden-ratio-and-rems',
        permanent: true
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
