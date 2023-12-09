'use client'

import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

export interface SearchResults {
  id: number
  title: string
  url: string
  type: string
  subtype: string
}

interface DrawerProps {
  isOpen: boolean
  children: React.ReactNode
}

/**
 * Search the WordPress REST API for posts matching the query.
 *
 * @see https://developer.wordpress.org/rest-api/reference/search-results/
 */
async function searchQuery(query: string): Promise<SearchResults[]> {
  // Sanitize the query.
  query = encodeURIComponent(query.trim())

  try {
    // Fetch the search results.
    const response = await fetch(
      `https://blog.gregrickaby.com/wp-json/wp/v2/search?search=${query}&subtype=any&per_page=100`,
      {
        next: {
          tags: ['search']
        }
      }
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const data = await response.json()

    // Verify data has posts.
    if (!data || data.length === 0) {
      throw new Error('No posts found.')
    }

    // Return the data.
    return data as SearchResults[]
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}

/**
 * Drawer component.
 */
function Drawer({isOpen, children}: DrawerProps) {
  return (
    <div
      className={`transition-all  duration-300 ease-in-out dark:bg-zinc-600 ${
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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = useCallback(async () => {
    // If the query is empty or too long, return early.
    if (query.length === 0 || query.length > 100) return

    // Set the loading state.
    setIsLoading(true)

    // Perform the search.
    try {
      const data = await searchQuery(query)
      setResults(data)
    } catch (error) {
      console.error(error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  // Debounce the search query.
  useEffect(() => {
    if (query.length > 0) {
      const debounceTimeout = setTimeout(performSearch, 500)
      return () => clearTimeout(debounceTimeout)
    }
  }, [query, performSearch])

  // Keyboard shortcuts.
  useEffect(() => {
    // Handle keyboard shortcuts.
    function handleKeyPress(event: KeyboardEvent) {
      // CMD+K or CTRL+K opens the search palette.
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsPaletteOpen((prevState) => !prevState)

        // Wait for the palette to open.
        setTimeout(() => {
          if (!isPaletteOpen) {
            inputRef.current?.focus() // Set focus on search input.
          }
        }, 200)

        // ESC closes and resets search.
      } else if (event.key === 'Escape') {
        resetSearch()
      }
    }

    // Add the event listener.
    window.addEventListener('keydown', handleKeyPress)

    // Remove the event listener.
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPaletteOpen])

  // Reset the search.
  function resetSearch() {
    setIsLoading(false)
    setIsPaletteOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div
      className={`fixed left-0 top-0 flex h-screen w-screen items-start justify-center bg-zinc-500 bg-opacity-50 dark:bg-black dark:bg-opacity-50 ${
        isPaletteOpen ? 'visible' : 'invisible'
      }`}
    >
      <div
        className="relative w-full max-w-lg rounded-md bg-zinc-200 p-2 dark:bg-zinc-600"
        style={{marginTop: '15vh'}}
      >
        {isPaletteOpen && (
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
          {isLoading && <p className="m-0">Searching...</p>}
          {!isLoading && query && results.length === 0 && (
            <p className="m-0">Bummer. No results found.</p>
          )}
          {!isLoading && results.length > 0 && (
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
