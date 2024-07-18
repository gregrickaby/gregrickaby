import {getAllPages, getAllPosts} from '@/lib/api'
import config from '@/lib/config'
import {Post} from '@/lib/types'
import {MetadataRoute} from 'next'

/**
 * Helper function to generate sitemap entries.
 */
function generateSitemapEntries(
  items: Post[],
  urlPrefix: string
): MetadataRoute.Sitemap {
  return items
    .filter((item) => item.yoast_head_json.robots.index !== 'noindex') // Exclude noindex items.
    .map((item) => ({
      url: `${config.siteUrl}${urlPrefix}${item.slug}`,
      lastModified: new Date(
        item.yoast_head_json.article_modified_time
      ).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5
    }))
}

/**
 * The sitemap.xml route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all the pages and posts.
  const allPages = await getAllPages()
  const allPosts = await getAllPosts()

  // Generate sitemap entries for pages.
  const pagesSitemapEntries = generateSitemapEntries(
    allPages.filter((page) => page.slug !== 'home'), // Exclude the home page.
    '/'
  )

  // Generate sitemap entries for posts.
  const postsSitemapEntries = generateSitemapEntries(allPosts, '/blog/')

  // Combine entries.
  const sitemapEntries = [...pagesSitemapEntries, ...postsSitemapEntries]

  // Return the sitemap.
  return sitemapEntries
}
