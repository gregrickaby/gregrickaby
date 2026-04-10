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
      // Example: old WordPress category URLs
      // {
      //   source: '/category/:slug',
      //   destination: '/category/:slug',
      //   permanent: true
      // },
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
