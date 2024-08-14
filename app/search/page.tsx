import {Search} from '@/components/Search'

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
