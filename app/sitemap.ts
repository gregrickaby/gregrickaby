import {siteConfig} from '@/lib/config'
import {getAllPosts} from '@/lib/content'
import {MetadataRoute} from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: 'monthly',
    priority: 0.7
  }))

  const navEntries: MetadataRoute.Sitemap = siteConfig.nav
    .filter((item) => !('external' in item && item.external))
    .map((item) => ({
      url: `${siteConfig.url}${item.href}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 'priority' in item ? item.priority : 0.7
    }))

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    ...navEntries,
    ...postEntries
  ]
}
