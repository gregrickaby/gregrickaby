import config from '@/lib/config'
import getPages from '@/lib/queries/getPages'
import getPosts from '@/lib/queries/getPosts'
import {MetadataRoute} from 'next'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const revalidate = 43200 // 12 hours

/**
 * The sitemap route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all the pages and posts.
  const allPages = await getPages()
  const allPosts = await getPosts()

  // Generate sitemap entries for pages.
  const pagesSitemapEntries = allPages
    .filter((page) => page.seo.metaRobotsNoindex !== 'noindex')
    .map((page) => ({
      url: `${config.siteUrl}/${page.slug}`,
      lastModified: new Date(page.modified).toISOString()
    }))

  // Generate sitemap entries for posts.
  const postsSitemapEntries = allPosts.edges
    .filter(({node}) => node.seo.metaRobotsNoindex !== 'noindex')
    .map(({node}) => ({
      url: `${config.siteUrl}/blog/${node.slug}`,
      lastModified: new Date(node.modified).toISOString()
    }))

  // Combine entries.
  const sitemapEntries = [...pagesSitemapEntries, ...postsSitemapEntries]

  // Return the sitemap.
  return sitemapEntries
}
