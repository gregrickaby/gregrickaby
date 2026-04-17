import {logger} from '@/lib/axiom/server'
import {transformMiddlewareRequest} from '@axiomhq/nextjs'
import {type NextFetchEvent, type NextRequest, NextResponse} from 'next/server'

/**
 * Next.js middleware to process incoming requests.
 *
 * Note: The middleware file convention is deprecated and has been renamed to proxy.
 *
 * @param request - The incoming Next.js request object.
 * @param event - The Next.js fetch event, used to manage asynchronous tasks.
 * @returns A NextResponse that allows the request to continue to the next middleware or route handler.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export async function proxy(request: NextRequest, event: NextFetchEvent) {
  /**
   * Log incoming requests for monitoring and debugging, excluding noisy routes.
   */
  const {pathname} = request.nextUrl
  const isNoiseRoute =
    pathname.startsWith('/api/healthcheck') || pathname.startsWith('/api/axiom')

  if (!isNoiseRoute) {
    logger.info(...transformMiddlewareRequest(request))
    const flushPromise = logger.flush()
    if (event) {
      event.waitUntil(flushPromise)
    } else {
      void flushPromise
    }
  }

  return NextResponse.next()
}

/**
 * Configure which routes the proxy runs on.
 * Using matcher for performance - only runs on specified paths.
 *
 * Matcher pattern for dynamic, non-static routes:
 * - Matches all request paths under `/`
 * - Excludes:
 *   - `_next/static` (Next.js static assets)
 *   - `_next/image` (Next.js image optimization endpoint)
 *   - `favicon.ico` (site favicon)
 *   - Public asset files with extensions: svg, png, jpg, jpeg, gif, webp
 *
 * The negative lookahead ensures these asset paths are skipped so the
 * proxy only runs for HTML/document routes where SEO headers matter.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
