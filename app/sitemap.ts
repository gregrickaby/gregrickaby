import config from '@/lib/config'
import {MetadataRoute} from 'next'

/**
 * Generate a sitemap.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: config.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1
    },
    {
      url: `${config.siteUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5
    }
  ]
}
