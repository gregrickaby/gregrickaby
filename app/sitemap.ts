import type { MetadataRoute } from 'next'

import {
  getAllCategories,
  getAllPosts,
  getAllTags,
  getBuildTime,
  getPage,
  getPhotos,
  getPostsByCategory,
  getPostsByTag,
} from '@/lib/content'
import { NAV, SITE } from '@/lib/site'
import type { PostMeta } from '@/lib/types'

/** The newest change among some posts. Crawlers ignore a `lastmod` that moves on every deploy. */
function getLatest(posts: PostMeta[], fallback: Date): Date {
  const times = posts.map((post) => new Date(post.modified).getTime())
  return times.length ? new Date(Math.max(...times)) : fallback
}

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date(getBuildTime())
  const posts = getAllPosts()
  const newest = getLatest(posts, built)
  const pageDate = (slug: string) => {
    const modified = getPage(slug)?.meta.modified
    return modified ? new Date(modified) : built
  }
  const taken = getPhotos()[0]?.dateTaken
  const lastModified: Record<string, Date | undefined> = {
    '/blog': newest,
    '/contact': pageDate('contact'),
    '/photos': taken ? new Date(taken) : built,
    '/resume': pageDate('resume'),
  }

  const pages: MetadataRoute.Sitemap = NAV.filter((link) => !link.external).map((link) => ({
    url: `${SITE.url}${link.href}`,
    lastModified: lastModified[link.href],
    changeFrequency: 'monthly',
    priority: link.priority,
  }))

  const archives: MetadataRoute.Sitemap = [
    ...getAllCategories().map((name) => ({
      url: `${SITE.url}/category/${encodeURIComponent(name)}`,
      lastModified: getLatest(getPostsByCategory(name), built),
    })),
    ...getAllTags().map((name) => ({
      url: `${SITE.url}/tag/${encodeURIComponent(name)}`,
      lastModified: getLatest(getPostsByTag(name), built),
    })),
  ].map((entry) => ({ ...entry, changeFrequency: 'monthly' as const, priority: 0.4 }))

  return [
    { url: SITE.url, lastModified: newest, changeFrequency: 'weekly', priority: 1 },
    ...pages,
    {
      url: `${SITE.url}/gear`,
      lastModified: pageDate('gear'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: `${SITE.url}/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...archives,
  ]
}
