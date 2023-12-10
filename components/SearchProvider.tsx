'use client'

import {Children} from '@/lib/types'
import {createContext, useContext, useEffect, useState} from 'react'

// Create context.
const SearchContext = createContext({
  toggleSearch: false,
  setToggleSearch: (toggleSearch: boolean) => {}
})

// Provider component.
export default function SearchProvider({children}: Children) {
  const [toggleSearch, setToggleSearch] = useState(false)

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setToggleSearch(!toggleSearch)
      } else if (event.key === 'Escape') {
        setToggleSearch(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleSearch])

  return (
    <SearchContext.Provider value={{toggleSearch, setToggleSearch}}>
      {children}
    </SearchContext.Provider>
  )
}

// Hook to use the context.
export function useSearch() {
  return useContext(SearchContext)
}
