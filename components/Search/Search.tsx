'use client'

import {searchQuery} from '@/lib/api/search'
import {SearchResults} from '@/lib/types'
import {IconLoader} from '@tabler/icons-react'
import {useDebounce} from '@uidotdev/usehooks'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import styles from './Search.module.css'

/**
 * Search component.
 */
export function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, 300)

  /**
   * Perform the search when the debounced query changes.
   */
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length === 0 || debouncedQuery.length > 100) {
        setResults(null)
        setError(null)
        return
      }

      setError(null)

      try {
        const data = await searchQuery(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error('Search failed:', error)
        setError('An error occurred while searching. Please try again.')
        setResults([])
      }
    }

    performSearch()
  }, [debouncedQuery])

  const resetSearch = () => {
    setQuery('')
    setResults(null)
    setError(null)
  }

  return (
    <>
      <div className={styles.search}>
        <input
          aria-label="Search"
          name="search"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Begin typing to search..."
          type="search"
          value={query}
        />

        {!results && query.length > 0 && (
          <IconLoader className={styles.loading} />
        )}

        {error && <p className={styles.error}>{error}</p>}

        {results && results.length === 0 && !error && <p>No results found.</p>}

        {results && results.length > 0 && (
          <div className={styles.results} aria-live="polite">
            <p>
              Nice! You found{' '}
              <span className={styles.number}>{results.length}</span> results
              for <span className={styles.query}>{debouncedQuery}</span>
            </p>
            <ol>
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.url.replace('https://blog.', 'https://')}
                    onClick={resetSearch}
                  >
                    <span
                      className={styles.title}
                      dangerouslySetInnerHTML={{__html: result.title}}
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  )
}
