'use server'

import {revalidateTag} from 'next/cache'
import {NextRequest, NextResponse} from 'next/server'

// Centralize the headers.
const defaultHeaders = {
  'X-Robots-Tag': 'noindex' // Prevent search engines from indexing.
}

// Validate the secret at build time.
if (!process.env.REVALIDATION_SECRET) {
  throw new Error(
    'REVALIDATION_SECRET is not set in the environment variables.'
  )
}

/**
 * On-demand revalidation handler.
 *
 * ### Important
 * This route _must_ be a GET request!
 *
 * ### Usage
 *
 * Send a GET request (with secret header) to:
 * `/api/revalidate?slug=foo-bar-baz`
 *
 * ### References
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation
 * @see https://nextjs.org/docs/app/api-reference/functions/revalidateTag
 */
async function handleRevalidation(request: NextRequest) {
  // Get the secret and slug from the request and validate.
  const secret = request.headers.get('x-vercel-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      {error: 'Invalid revalidation secret.', ok: false},
      {status: 401, headers: defaultHeaders}
    )
  }

  // Get the slug from the query parameters and validate.
  const slug = request?.nextUrl?.searchParams?.get('slug')
  if (!slug) {
    return NextResponse.json(
      {error: 'Missing slug query parameter.', ok: false},
      {status: 400, headers: defaultHeaders}
    )
  }

  try {
    // Revalidate the post by slug.
    revalidateTag(slug)

    // Log the revalidation.
    console.info(
      `Revalidation triggered for slug: ${slug} at ${new Date().toISOString()}`
    )

    // Return success response.
    return NextResponse.json(
      {
        ok: true,
        revalidatePath: slug,
        revalidated: true,
        revalidationTime: new Date().toISOString()
      },
      {headers: defaultHeaders}
    )
  } catch (error) {
    // Get the error message.
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error.'

    // Log the error.
    console.error(`Failed to revalidate slug: ${slug}. Error: ${errorMessage}`)

    // Return error response.
    return NextResponse.json(
      {
        error: errorMessage,
        ok: false,
        revalidatePath: slug,
        revalidated: false,
        revalidationTime: new Date().toISOString()
      },
      {status: 500, headers: defaultHeaders}
    )
  }
}

// Handle unsupported HTTP methods.
async function handleUnsupportedMethod() {
  return NextResponse.json(
    {error: 'Method Not Allowed', ok: false},
    {status: 405, headers: defaultHeaders}
  )
}

// Export the handlers.
export const GET = handleRevalidation
export const DELETE = handleUnsupportedMethod
export const POST = handleUnsupportedMethod
export const PUT = handleUnsupportedMethod
