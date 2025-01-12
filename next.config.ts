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
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.**',
        pathname: '/**'
      }
    ]
  },
  async redirects() {
    return [
      {source: '/:path*.html', destination: '/', permanent: true},
      {source: '/:path*.php', destination: '/', permanent: true},
      {source: '/feed', destination: '/feed.xml', permanent: true},
      {source: '/rss', destination: '/feed.xml', permanent: true},
      {source: '/rss.xml', destination: '/feed.xml', permanent: true},
      {source: '/blog/feed', destination: '/feed.xml', permanent: true},
      {source: '/feed/atom', destination: '/feed.xml', permanent: true},
      {source: '/blog/xmlrpc.php', destination: '/feed.xml', permanent: true},
      {source: '/wp-:path*', destination: '/', permanent: true},
      {source: '/blog/wp-:path*', destination: '/', permanent: true},
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
        source: '/homepage',
        destination: '/',
        permanent: true
      },
      {
        source: '/resources',
        destination: '/',
        permanent: true
      },
      {
        source: '/media',
        destination: '/',
        permanent: true
      },
      {
        source: '/articles',
        destination: '/blog',
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
        source: '/custom-rss-template-wordpress-2',
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
      },
      {
        source: '/create-mu-plugin-for-wordpress',
        destination: '/blog/create-mu-plugin-for-wordpress',
        permanent: true
      },
      {
        source: '/how-to-install-lamp-on-ubuntu',
        destination: '/blog/how-to-install-lamp-on-ubuntu',
        permanent: true
      },
      {
        source: '/blog/modify-wordpress-custom-post-type-2',
        destination: '/blog/modify-wordpress-custom-post-type',
        permanent: true
      },
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
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
