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
        hostname: '**.gregrickaby.**',
        pathname: '/**'
      }
    ]
  },
  async redirects() {
    return [
      // Redirect all /blog/* to the subdomain
      {
        source: '/blog/:path*',
        destination: 'https://blog.gregrickaby.com/:path*',
        permanent: true
      },

      // RSS & Feeds — redirect to blog.gregrickaby.com/feed
      {
        source: '/feed.xml',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/feed.json',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/feed',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/rss',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/rss.xml',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/feed/atom',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/blog/feed',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },
      {
        source: '/blog/xmlrpc.php',
        destination: 'https://blog.gregrickaby.com/feed',
        permanent: true
      },

      // Old WordPress stuff
      {source: '/:path*.html', destination: '/', permanent: true},
      {source: '/:path*.php', destination: '/', permanent: true},
      {source: '/wp-:path*', destination: '/', permanent: true},
      {source: '/blog/wp-:path*', destination: '/', permanent: true},

      // Legacy permalinks now pointing directly to the blog subdomain
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug*',
        destination: 'https://blog.gregrickaby.com/:slug*',
        permanent: true
      },
      {
        source: '/category/:slug*',
        destination: 'https://blog.gregrickaby.com/category/:slug*',
        permanent: true
      },
      {
        source: '/tag/:slug*',
        destination: 'https://blog.gregrickaby.com/tag/:slug*',
        permanent: true
      },
      {
        source: '/articles',
        destination: 'https://blog.gregrickaby.com',
        permanent: true
      },

      // Legacy pages
      {source: '/home', destination: '/', permanent: true},
      {source: '/homepage', destination: '/', permanent: true},
      {source: '/resources', destination: '/', permanent: true},
      {source: '/media', destination: '/', permanent: true},

      // Manifest
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
        permanent: true
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
