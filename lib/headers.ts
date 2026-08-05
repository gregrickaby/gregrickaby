/**
 * Content-Security-Policy value. `unsafe-inline` is required for both
 * script-src (our own JSON-LD `<script>` tags and Mantine's
 * `ColorSchemeScript`) and style-src (shiki/rehype-pretty-code inline
 * `style` attributes on every syntax-highlighted code block, plus Mantine's
 * CSS variable injection) — nonces would force dynamic rendering on every
 * route, which conflicts with the static shell Cache Components prerenders.
 * `experimental.sri` in next.config.ts covers integrity of the JS bundles
 * this can't lock down further. `unsafe-eval` is added in development only:
 * React uses `eval()` there to reconstruct server error stack traces in the
 * browser; it's never used in production. `static.cloudflareinsights.com` is
 * Cloudflare's Web Analytics beacon, injected at the edge because the site
 * is proxied through Cloudflare — its telemetry POST goes to same-origin
 * `/cdn-cgi/rum`, already covered by `connect-src 'self'`.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests'
].join('; ')

const headers = [
  {
    source: '/:path*',
    headers: [
      {key: 'X-DNS-Prefetch-Control', value: 'on'},
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
      },
      {key: 'Content-Security-Policy', value: contentSecurityPolicy}
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
