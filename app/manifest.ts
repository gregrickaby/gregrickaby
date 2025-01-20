import config from '@/lib/config'
import {MetadataRoute} from 'next'

/**
 * The manifest.json route.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.siteName,
    short_name: config.siteName,
    description: config.siteDescription,
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png'
      }
    ]
  }
}
