import {WP_Query} from '@/lib/api/WP_Query'
import type {Post} from '@/lib/types'
import {notFound} from 'next/navigation'

/**
 * Fetch a blog post by slug.
 */
export async function fetchPostBySlug(slug: string): Promise<Post> {
  // Setup the query.
  const query = new WP_Query({
    post_type: 'posts',
    slug: slug,
    fields: [
      'id',
      'title',
      'content',
      'excerpt',
      'date',
      'author_name',
      'author_gravatar_url',
      'featured_image_data',
      'category_names',
      'tag_names',
      'yoast_head_json'
    ]
  })

  // Get the post by slug.
  const [post] = await query.getPosts()

  // No post? Bail...
  if (!post) {
    return notFound()
  }

  return post
}
