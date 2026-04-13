import {logger} from '@/lib/axiom/server'
import {transformMiddlewareRequest} from '@axiomhq/nextjs'
import {type NextFetchEvent, type NextRequest, NextResponse} from 'next/server'

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const userAgent = request.headers.get('user-agent') ?? ''
  const isHealthCheck = userAgent.toLowerCase().startsWith('curl/')

  if (!isHealthCheck) {
    logger.info(...transformMiddlewareRequest(request))
    event.waitUntil(logger.flush())
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}
