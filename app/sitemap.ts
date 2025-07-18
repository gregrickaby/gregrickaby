import {WP_Query} from '@/lib/api/WP_Query'
import config from '@/lib/config'
import {Post} from '@/lib/types'
import {MetadataRoute} from 'next'

const pageQuery = new WP_Query({
  per_page: 100,
  post_type: 'pages',
  status: 'publish',
  _fields: ['slug', 'yoast_head_json']
})

const postQuery = new WP_Query({
  per_page: 100,
  post_type: 'posts',
  status: 'publish',
  _fields: ['slug', 'yoast_head_json']
})

/**
 * Generate sitemap entries from WordPress pages and posts.
 */
function generateWPEntries(
  items: Post[],
  urlPrefix: string
): MetadataRoute.Sitemap {
  const excludedSlugs = ['home', 'homepage', 'photos'] // Exclude these slugs from sitemap.
  return items
    .filter(
      (item) =>
        item.yoast_head_json.robots.index !== 'noindex' &&
        !excludedSlugs.includes(item.slug)
    )
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
 * Generate sitemap entries for hardcoded pages.
 */
function generateHardcodedEntries(
  pages: {
    slug: string
    priority: number
    noindex: boolean
    lastModified: string
  }[],
  siteUrl: string
): MetadataRoute.Sitemap {
  return pages
    .filter((page) => !page.noindex)
    .map((page) => ({
      url: `${siteUrl}${page.slug}`,
      lastModified: new Date(page.lastModified).toISOString(),
      changeFrequency: 'monthly',
      priority: page.priority
    }))
}

/**
 * Generate sitemap for the website.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch WordPress pages and posts.
    const allPages = await pageQuery.getPosts().catch(() => [])
    const allPosts = await postQuery.getPosts().catch(() => [])

    // Hardcoded pages with metadata.
    const hardcodedPages = [
      {
        slug: '',
        priority: 1.0,
        noindex: false,
        lastModified: '2025-01-10T10:00:00.000Z'
      },
      {
        slug: '/blog',
        priority: 0.8,
        noindex: false,
        lastModified: '2025-01-05T08:00:00.000Z'
      },
      {
        slug: '/contact',
        priority: 0.6,
        noindex: false,
        lastModified: '2024-12-31T15:00:00.000Z'
      },
      {
        slug: '/search',
        priority: 0.5,
        noindex: true,
        lastModified: '2025-01-12T18:54:34.458Z'
      }
    ]

    // Generate sitemap entries.
    const pagesSitemapEntries = generateWPEntries(
      allPages.filter((page) => page.slug !== 'home'),
      '/'
    )
    const postsSitemapEntries = generateWPEntries(allPosts, '/blog/')
    const hardcodedSitemapEntries = generateHardcodedEntries(
      hardcodedPages,
      config.siteUrl
    )

    // Combine entries and return sitemap.
    return [
      ...hardcodedSitemapEntries,
      ...pagesSitemapEntries,
      ...postsSitemapEntries
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return []
  }
}
