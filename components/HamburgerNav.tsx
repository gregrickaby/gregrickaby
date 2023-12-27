'use client'

import {Menu} from '@/lib/types'
import Link from 'next/link'
import {useEffect, useState} from 'react'

interface HamburgerNavProps {
  menu: Menu
}

/**
 * Hamburger Nav / Drawer.
 */
export default function HamburgerNav({menu}: HamburgerNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Drawer toggle handler.
   */
  function toggleDrawer() {
    setIsOpen(!isOpen)
  }

  /**
   * Keyboard event handler.
   */
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // Add event listener.
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup.
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div>
      <button
        className="absolute right-2 top-1 p-1 md:relative"
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
        className={`fixed right-0 top-0 h-full w-64 transform bg-zinc-100 transition-all duration-500 ease-in-out dark:bg-zinc-700 ${
          isOpen ? 'z-50 translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          aria-label="Toggle menu"
          className="absolute right-3 top-3 p-1"
          onClick={toggleDrawer}
        >
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

        <nav className="flex flex-col gap-2 px-8 py-16">
          {!!menu.nodes.length &&
            menu.nodes.map((item) => (
              <Link
                className="flex items-center gap-2 no-underline hover:font-bold"
                href={item.uri}
                key={item.databaseId}
                onClick={toggleDrawer}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </div>
    </div>
  )
}
