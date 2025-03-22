import {WP_Query} from '@/lib/api/WP_Query'
import type {Post} from '@/lib/types'
import {notFound} from 'next/navigation'

/**
 * Fetch the page by slug.
 */
export async function fetchPageBySlug(slug: string): Promise<Post> {
  // Setup the query.
  const query = new WP_Query({
    post_type: 'pages',
    slug: slug,
    _fields: ['content', 'title', 'yoast_head_json']
  })

  // Get the page by slug.
  const [page] = await query.getPosts()

  // No page? Bail...
  if (!page) {
    return notFound()
  }

  return page
}
