import type { Metadata } from 'next'
import { PageTitle } from '@/components/page-title'
import { PostGrid } from '@/components/post-grid'
import { SearchForm } from '@/components/search-form'
import { searchPosts } from '@/lib/content'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
}

/** The query, from `?q=`. Repeated params use the first value. */
function queryOf(q: string | string[] | undefined): string {
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
}

async function Results({ searchParams }: { searchParams: PageProps<'/search'>['searchParams'] }) {
  const query = queryOf((await searchParams).q)
  const posts = searchPosts(query)

  return (
    <>
      <div className={styles.form}>
        <SearchForm defaultValue={query} id="search-page" />
      </div>
      {!query ? null : posts.length === 0 ? (
        <p className={styles.status} role="status">
          No posts match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          <p className={styles.status} role="status">
            {posts.length} {posts.length === 1 ? 'post matches' : 'posts match'} &ldquo;{query}
            &rdquo;.
          </p>
          <PostGrid posts={posts} />
        </>
      )}
    </>
  )
}

/*
 * Blocks on `?q=` instead of streaming results behind Suspense, so the
 * results are in the HTML for readers without JavaScript.
 */
export const instant = false

/**
 * Searches post titles, descriptions, categories, and tags. The only page
 * that renders per request, because the results depend on `?q=`.
 */
export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <>
      <PageTitle>Search</PageTitle>
      <Results searchParams={searchParams} />
    </>
  )
}
