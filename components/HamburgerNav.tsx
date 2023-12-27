'use client'

import {useSearch} from '@/components/SearchProvider'
import Link from 'next/link'
import {useState} from 'react'
import {FaMagnifyingGlass} from 'react-icons/fa6'

/**
 * Hamburger Nav / Drawer.
 */
export default function HamburgerNav() {
  const [isOpen, setIsOpen] = useState(false)
  const {toggleSearch, setToggleSearch} = useSearch()

  /**
   * Toggle Drawer.
   */
  function toggleDrawer() {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      {/* Toggle Button */}
      <button
        className="absolute right-2 top-1 p-4 md:relative"
        onClick={toggleDrawer}
      >
        {isOpen ? (
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        ) : (
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        )}
      </button>

      <div
        className={`fixed right-0 top-0 h-full w-64 transform bg-zinc-100 transition-all duration-300 ease-in-out dark:bg-zinc-700 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button Inside Drawer */}
        <button
          aria-label="Toggle menu"
          className="absolute right-3 top-3 p-1"
          onClick={toggleDrawer}
        >
          {/* Close Icon (Inside Drawer) */}
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {/* Navigation Links */}
        <nav className="flex flex-col gap-4 px-8 py-16 text-left text-xl">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/feed">RSS</Link>
          <button
            aria-label="Search"
            title="Search"
            className="flex items-center gap-4 rounded bg-transparent p-2 transition-all duration-300 ease-in-out hover:bg-zinc-200 dark:text-white dark:hover:bg-zinc-700"
            onClick={() => setToggleSearch(!toggleSearch)}
          >
            <FaMagnifyingGlass />
            <span className="rounded-l-md rounded-r-md bg-zinc-400 p-1 font-mono text-xs text-zinc-900">
              CMD+K
            </span>
          </button>
        </nav>
      </div>
    </div>
  )
}
