'use client'

import {searchQuery} from '@/lib/api/search'
import {SearchResults} from '@/lib/types'
import {IconLoader} from '@tabler/icons-react'
import {useDebounce} from '@uidotdev/usehooks'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import styles from './Search.module.css'

/**
 * Search component.
 */
export function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noResults, setNoResults] = useState<boolean>(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Set focus to the input when the component mounts.
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  /**
   * Perform the search when the debounced query changes.
   */
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length === 0 || debouncedQuery.length > 100) {
        setResults(null)
        setError(null)
        setNoResults(false)
        return
      }

      setError(null)
      setNoResults(false)

      try {
        const data = await searchQuery(debouncedQuery)

        // Check if there are no results.
        if (data.length === 0) {
          setNoResults(true)
          setResults([]) // Set empty results, no need for error.
        } else {
          setResults(data)
          setNoResults(false) // There are results.
        }
      } catch (error) {
        console.error('Search failed:', error)
        setError(
          'Something went wrong while searching. Please try again later.'
        )
        setResults(null) // Clear results on error.
        setNoResults(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const resetSearch = () => {
    setQuery('')
    setResults(null)
    setError(null)
    setNoResults(false)
  }

  return (
    <div className={styles.search}>
      <input
        aria-label="Search"
        name="search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Begin typing to search..."
        ref={inputRef}
        type="search"
        value={query}
      />

      {!results && query.length > 0 && !error && (
        <IconLoader className="loading" />
      )}

      {error && <p className={styles.error}>{error}</p>}

      {noResults && !error && <p>No results found. Try a different search.</p>}

      {results && results.length > 0 && (
        <div className={styles.results} aria-live="polite">
          <p>
            Nice! You found{' '}
            <span className={styles.number}>{results.length}</span> results for{' '}
            <span className={styles.query}>{debouncedQuery}</span>
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
  )
}
