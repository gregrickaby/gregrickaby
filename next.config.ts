import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    contentDispositionType: 'inline',
    formats: ['image/avif', 'image/webp'],
    qualities: [80]
  },
  experimental: {
    inlineCss: true,
    prefetchInlining: true,
    appNewScrollHandler: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/spotlight',
      '@tabler/icons-react'
    ],
    sri: {
      algorithm: 'sha256'
    }
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  // 301 redirects for old WordPress URLs and other legacy paths.
  async redirects() {
    return [
      // Old WordPress date-based URLs that map to existing posts.
      {
        source: '/2013/05/genesis-code-snippets',
        destination: '/genesis-code-snippets',
        permanent: true
      },
      {
        source: '/2013/05/microphone-shootout-behringer-b-1-vs-neumann-tlm-103',
        destination: '/microphone-shootout-behringer-b-1-vs-neumann-tlm-103',
        permanent: true
      },
      {
        source: '/2014/03/hello-chloe-grace',
        destination: '/hello-chloe-grace',
        permanent: true
      },
      {
        source: '/2013/05/how-to-install-lamp-on-ubuntu',
        destination: '/how-to-install-lamp-on-ubuntu',
        permanent: true
      },
      {
        source: '/2011/05/how-to-install-lamp-on-ubuntu-1104-natty.html',
        destination: '/how-to-install-lamp-on-ubuntu',
        permanent: true
      },
      {
        source: '/2017/02/2016-a-year-in-review',
        destination: '/2016-a-year-in-review',
        permanent: true
      },
      // Old WordPress pagination.
      {
        source: '/page/:num',
        destination: '/',
        permanent: true
      },
      {
        source: '/blog/page/:num',
        destination: '/',
        permanent: true
      },
      // Old WordPress author pages.
      {
        source: '/author/:slug',
        destination: '/',
        permanent: true
      },
      // Old category and tag URLs that no longer exist.
      {source: '/category/photos', destination: '/', permanent: true},
      {source: '/tag/disney', destination: '/', permanent: true},
      {source: '/tag/gx85', destination: '/', permanent: true},
      {source: '/tag/portrait', destination: '/', permanent: true},
      {source: '/tag/portraits', destination: '/', permanent: true},
      {source: '/tag/snow', destination: '/', permanent: true},
      // Old slugs that no longer exist.
      {
        source: '/2013-2014-alabama-hunting-seasons',
        destination: '/',
        permanent: true
      },
      {
        source: '/adventure-panama-city-florida-2022',
        destination: '/',
        permanent: true
      },
      {
        source: '/dreamy-milky-way-on-august-8',
        destination: '/',
        permanent: true
      },
      {source: '/ehs-graduation-2023', destination: '/', permanent: true},
      {source: '/faq', destination: '/', permanent: true},
      {source: '/happy-little-trees', destination: '/', permanent: true},
      {source: '/home-networking-upgrade', destination: '/', permanent: true},
      {
        source: '/mobile-website-statistics-from-2009-through-2013',
        destination: '/',
        permanent: true
      },
      {
        source: '/movie-theater-popcorn-at-home',
        destination: '/',
        permanent: true
      },
      {source: '/pcb-wheel', destination: '/', permanent: true},
      {source: '/perfect-symmetry', destination: '/', permanent: true},
      {
        source: '/podcasting-sound-like-a-radio-dj',
        destination: '/',
        permanent: true
      },
      {source: '/recommended-services', destination: '/', permanent: true},
      {source: '/sugar-coated-street-art', destination: '/', permanent: true},
      {
        source: '/summer-vacation-2015-day-one-camp-cracker-barrell',
        destination: '/',
        permanent: true
      },
      {source: '/sunset-around-the-bed', destination: '/', permanent: true},
      {
        source: '/the-perfect-apc-configuration',
        destination: '/',
        permanent: true
      },
      {source: '/the-perfect-pan-pizza', destination: '/', permanent: true},
      {
        source: '/we-went-chasing-waterfalls',
        destination: '/',
        permanent: true
      },
      {source: '/webcam', destination: '/', permanent: true},
      {
        source: '/wordpress-with-apache-2-4-and-php-5-5',
        destination: '/',
        permanent: true
      },
      // Catch-all for remaining old WordPress date-based URLs (must be last).
      {
        source: '/:year(20[0-9]{2})/:month([0-9]{2})/:path*',
        destination: '/',
        permanent: true
      }
    ]
  },
  // Add security headers to all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        // Cache public folder assets (images, fonts, etc.)
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2|avif|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

export default nextConfig
