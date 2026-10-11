import type { MetadataRoute } from 'next'
import { getAllPosts, getBuildTime } from '@/lib/content'
import { NAV, SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date(getBuildTime())

  const pages: MetadataRoute.Sitemap = NAV.filter((link) => !link.external).map((link) => ({
    url: `${SITE.url}${link.href}`,
    lastModified: built,
    changeFrequency: 'monthly',
    priority: link.priority,
  }))

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE.url}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: SITE.url, lastModified: built, changeFrequency: 'weekly', priority: 1 },
    ...pages,
    ...posts,
  ]
}
