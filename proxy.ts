import { NextResponse, type NextRequest } from 'next/server'

import { errorFields, logger } from '@/lib/datadog/server'
import { isGonePath } from '@/lib/gone'
import { isMissingPath } from '@/lib/missing-path'

/** A path no route matches, so app/not-found.tsx renders it, shell and all. */
const MISSING = '/404/missing'

/**
 * Where this server can reach itself. In production a request out through the
 * public hostname loops through Cloudflare and fails, so go straight to the port.
 */
function selfOrigin(origin: string): string {
  return process.env.NODE_ENV === 'production'
    ? `http://127.0.0.1:${process.env.PORT ?? 3000}`
    : origin
}

let goneHtml: Promise<string> | undefined

/** The 404 page's HTML, fetched once per process. */
async function getGoneHtml(origin: string): Promise<string> {
  goneHtml ??= fetch(new URL(MISSING, selfOrigin(origin))).then((response) => {
    if (response.status !== 404) throw new Error(`${MISSING} answered ${response.status}`)
    return response.text()
  })
  try {
    return await goneHtml
  } catch (error) {
    goneHtml = undefined
    throw error
  }
}

/**
 * Answers removed pages with a 410 and rewrites unknown posts, tags, and
 * categories to the 404 page.
 */
export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  if (isGonePath(pathname)) {
    try {
      // A rewrite always answers 404, so the 410 has to carry the page itself.
      return new NextResponse(await getGoneHtml(origin), {
        status: 410,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    } catch (error) {
      logger.error('Could not load the 404 page for a 410', errorFields(error))
      return NextResponse.rewrite(new URL(MISSING, request.url))
    }
  }
  if (!isMissingPath(pathname)) return NextResponse.next()
  return NextResponse.rewrite(new URL(MISSING, request.url))
}

export const config = {
  matcher: [
    '/:slug',
    '/tag/:name',
    '/category/:name',
    '/author/:slug',
    '/wp-json/:path*',
    '/wp-admin/:path*',
    '/:year(20\\d{2})/:month(\\d{2})/:path*',
  ],
}
