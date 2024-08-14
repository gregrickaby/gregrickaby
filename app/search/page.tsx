import {Search} from '@/components/Search'
import config from '@/lib/config'
import {Metadata} from 'next'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Search - ${config.siteName}`,
    description: 'Use the search form to look for posts or pages.'
  }
}

/**
 * The SearchPage component.
 */
export default function SearchPage() {
  return (
    <article className="article">
      <h1>Search</h1>
      <p>Use the search form below to look for posts or pages.</p>
      <Search />
    </article>
  )
}
