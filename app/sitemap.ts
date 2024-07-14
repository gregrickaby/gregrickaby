import config from '@/lib/config'
import {MetadataRoute} from 'next'

/**
 * Route segment config.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
 */
export const revalidate = 43200 // 12 hours

/**
 * The sitemap.xml route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: config.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1
    }
  ]
}
