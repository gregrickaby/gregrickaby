import {NextRequest, NextResponse} from 'next/server'
import {getPosts} from '@/lib/wordpress'

/**
 * API route to fetch posts with pagination.
 * Used by infinite scroll component.
 *
 * @param request - Next.js request object
 * @returns JSON response with posts data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const after = searchParams.get('after')
    const first = parseInt(searchParams.get('first') || '12', 10)

    // Validate pagination parameters
    if (first < 1 || first > 100) {
      return NextResponse.json(
        {error: 'Invalid "first" parameter. Must be between 1 and 100.'},
        {status: 400}
      )
    }

    // Fetch posts from WordPress
    const data = await getPosts(first, after || undefined)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({error: 'Failed to fetch posts'}, {status: 500})
  }
}
