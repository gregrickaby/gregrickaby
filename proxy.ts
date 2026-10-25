import { NextResponse, type NextRequest } from 'next/server'

import { isMissingPath } from '@/lib/missing-path'

/** Rewrites unknown posts, tags, and categories to the 404 page. */
export function proxy(request: NextRequest) {
  if (!isMissingPath(request.nextUrl.pathname)) return NextResponse.next()
  // No route matches this path, so app/not-found.tsx renders it, shell and all, with a 404.
  return NextResponse.rewrite(new URL('/404/missing', request.url))
}

export const config = {
  matcher: ['/:slug', '/tag/:name', '/category/:name'],
}
