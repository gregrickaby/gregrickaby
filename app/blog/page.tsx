import {BlogArchive} from '@/components/BlogArchive'
import {WP_Query} from '@/lib/api'
import config from '@/lib/config'
import {Metadata} from 'next'

const initialQuery = new WP_Query({
  per_page: 10,
  page: 1,
  fields: ['id', 'slug', 'title', 'excerpt', 'featured_image_data', 'date'],
  orderby: 'date',
  order: 'desc'
})

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Blog - ${config.siteName}`,
    description:
      'Welcome to my blog. Here you will find posts dating back to 2013.'
  }
}

/**
 * Blog Archive.
 */
export default async function Blog() {
  // Get the initial posts.
  const posts = await initialQuery.getPosts()

  return (
    <article className="article">
      <h1>Blog</h1>
      <BlogArchive initialPosts={posts} />
    </article>
  )
}
