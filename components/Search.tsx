'use client'

import {useSearch} from '@/components/SearchProvider'
import {searchQuery} from '@/lib/functions'
import {SearchResults} from '@/lib/types'
import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

interface DrawerProps {
  isOpen: boolean
  children: React.ReactNode
}

/**
 * Drawer component.
 */
function Drawer({isOpen, children}: DrawerProps) {
  return (
    <div
      className={`text-left transition-all  duration-300 ease-in-out dark:bg-zinc-600 ${
        isOpen ? 'opacity-100mt-4 visible p-4' : 'invisible opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

/**
 * Search component.
 */
export default function Search() {
  const {toggleSearch, setToggleSearch} = useSearch()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Set focus on the input when the search palette opens.
  useEffect(() => {
    if (toggleSearch) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [toggleSearch])

  // Perform the search.
  const performSearch = useCallback(async () => {
    // If the query is empty or too long, return early.
    if (query.length === 0 || query.length > 100) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const data = await searchQuery(query)
      setResults(data)
    } catch (error) {
      console.error(error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  // Debounce the search query.
  useEffect(() => {
    if (query.length > 0) {
      const debounceTimeout = setTimeout(performSearch, 500)
      return () => clearTimeout(debounceTimeout)
    } else {
      setResults([])
      setHasSearched(false)
    }
  }, [query, performSearch])

  // Reset the search.
  function resetSearch() {
    setIsSearching(false)
    setQuery('')
    setResults([])
    setToggleSearch(false)
    setHasSearched(false)
  }

  return (
    <div
      className={`fixed left-0 top-0 flex h-screen w-screen items-start justify-center bg-zinc-500 bg-opacity-50 dark:bg-black dark:bg-opacity-50 ${
        toggleSearch ? 'visible' : 'invisible'
      }`}
    >
      <div
        className="relative w-full max-w-lg rounded-md bg-zinc-200 p-2 dark:bg-zinc-600"
        style={{marginTop: '15vh'}}
      >
        {toggleSearch && (
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              aria-label="Search"
              className="w-full rounded-md bg-zinc-100 p-4 outline-none dark:bg-zinc-500 dark:text-white"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Begin typing to search..."
              type="text"
              value={query}
            />
            <button
              aria-label="Close search"
              className="absolute right-2 rounded-r-md bg-zinc-400 p-1 font-mono text-xs text-zinc-200 transition-all duration-300 ease-in-out hover:bg-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              onClick={resetSearch}
              type="reset"
            >
              ESC
            </button>
          </div>
        )}

        <Drawer isOpen={query.length > 0}>
          {query.length > 0 && !hasSearched && (
            <p className="m-0">Searching...</p>
          )}
          {!isSearching && hasSearched && results.length === 0 && (
            <p className="m-0">Bummer. No results found.</p>
          )}
          {!isSearching && results.length > 0 && (
            <div className="max-h-[55vh] overflow-y-auto">
              <p className="m-0">
                Nice! You found{' '}
                <span className="border-b border-b-orange-300 font-bold">
                  {results.length}
                </span>{' '}
                results for{' '}
                <span className="bg-orange-300 p-1 text-zinc-800">{query}</span>
              </p>
              <ol>
                {results.map((result) => (
                  <li key={result.id}>
                    <Link
                      href={result.url.replace('https://blog.', 'https://')}
                      onClick={resetSearch}
                    >
                      <p
                        className="m-0 p-0"
                        dangerouslySetInnerHTML={{__html: result.title}}
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Drawer>
      </div>
    </div>
  )
}
