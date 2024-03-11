import Search from '@/components/Search'
import config from '@/lib/config'
import type {Metadata} from 'next/types'

/**
 * Generate the metadata for this route.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata | null> {
  return {
    title: `Search - ${config.siteName}`,
    description: `Search all pages and posts from ${config.siteName}`,
    alternates: {
      canonical: `${config.siteUrl}/search`
    },
    openGraph: {
      title: `Search - ${config.siteName}`,
      description: `Search all pages and posts from ${config.siteName}`,
      url: `${config.siteUrl}/search`
    }
  }
}

/**
 * Search route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default function Page() {
  return (
    <article>
      <h1>Search</h1>
      <Search />
    </article>
  )
}
