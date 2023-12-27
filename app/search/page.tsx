import Search from '@/components/Search'
import config from '@/lib/config'
import {Metadata} from 'next/types'

/**
 * Generate the metadata for this route.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: {
  params: {slug: string}
}): Promise<Metadata | null> {
  return {
    title: `Search - ${config.siteName}`,
    description: `Search all pages and posts from ${config.siteName}`
  }
}

/**
 * Search route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default function Page() {
  return (
    <>
      <h1>Search</h1>
      <Search />
    </>
  )
}
