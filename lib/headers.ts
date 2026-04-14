const headers = [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
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
      {key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}
    ]
  }
]

export default headers
