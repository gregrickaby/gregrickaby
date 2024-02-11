'use client'

import {Menu} from '@/lib/types'
import {IconBurger, IconX} from '@tabler/icons-react'
import Link from 'next/link'
import {useEffect, useState} from 'react'

/**
 * Hamburger Nav / Drawer.
 */
export default function Navigation({menu}: {menu: Menu}) {
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
        {isOpen ? <IconX size={48} /> : <IconBurger size={48} stroke={1} />}
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
          <IconX size={24} />
        </button>

        <nav className="flex flex-col gap-2 px-8 py-16">
          {!!menu.nodes.length &&
            menu.nodes.map((item) => (
              <Link
                className="flex items-center gap-2 no-underline hover:font-bold"
                href={item.uri}
                key={item.databaseId}
                onClick={toggleDrawer}
                prefetch={item.uri === '/feed.xml' ? false : true}
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </div>
    </div>
  )
}
