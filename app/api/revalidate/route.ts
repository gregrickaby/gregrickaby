import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const runtime = 'edge'

/**
 * On-demand revalidation.
 *
 * @usage POST /api/revalidate?slug=foo-bar-baz
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation
 */
export async function POST(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const secret = requestHeaders.get('x-vercel-revalidation-secret')
  const slug = request.nextUrl.searchParams.get('slug')

  if (secret !== process.env.NEXTJS_REVALIDATION_SECRET) {
    return Response.json(
      {revalidated: false, message: 'Invalid secret'},
      {status: 401}
    )
  }

  if (!slug) {
    return Response.json(
      {revalidated: false, message: 'Invalid slug parameter.'},
      {status: 400}
    )
  }

  // Revalidate the slug.
  revalidatePath(`/blog/${slug}, 'page')

  return Response.json({
    revalidated: true,
    slug,
    now: Date.now()
  })
}
