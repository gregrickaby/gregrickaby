import { CONTENT_SIGNAL } from './content-signal'

/**
 * Content-Security-Policy value. `unsafe-inline` is required for script-src
 * (JSON-LD `<script>` tags and the root layout's theme script) and style-src
 * (shiki's inline `style` attributes on code blocks). Nonces would force
 * dynamic rendering on every route, which `ensureStatic` forbids.
 * `experimental.sri` in next.config.ts covers the integrity of JS bundles.
 * `unsafe-eval` is added in development only: React uses `eval()` there to
 * rebuild server error stacks in the browser. `static.cloudflareinsights.com`
 * is Cloudflare's Web Analytics beacon, injected at the edge; its POST goes to
 * same-origin `/cdn-cgi/rum`, already covered by `connect-src 'self'`.
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
  'upgrade-insecure-requests',
].join('; ')

/** HTTP security and caching headers, applied via `next.config.ts`. */
export const headers = [
  {
    source: '/:path*',
    headers: [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      // Points agents at the llms.txt index of the site's Markdown copies.
      { key: 'Link', value: '</llms.txt>; rel="describedby"' },
      // Cloudflare's Markdown for Agents otherwise stamps its permissive default
      // on converted responses; this keeps them in line with robots.txt.
      { key: 'Content-Signal', value: CONTENT_SIGNAL },
    ],
  },
  {
    // Cache public folder assets (images, fonts, etc.)
    source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2|avif|ttf|otf)',
    headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
  },
]
