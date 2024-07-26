'use client'

import config from '@/lib/config'
import {IconMenu, IconX} from '@tabler/icons-react'
import Link from 'next/link'
import {MouseEvent, useEffect, useRef, useState} from 'react'

/**
 * Navigation component.
 */
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef<HTMLDivElement | null>(null)

  /**
   * Handle link click.
   */
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  /**
   * Handle click outside.
   *
   * @param event - Mouse event.
   * @returns void
   */
  const handleClickOutside = (event: MouseEvent | Event) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  /**
   * Add event listener.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav ref={navRef} className="relative" data-testid="nav">
      <div className="flex items-center justify-between">
        <button
          className="flex rounded border p-2 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>
      <div
        className={`${
          isOpen ? 'flex' : 'hidden'
        } absolute right-0 top-12 z-10 flex-col gap-4 rounded-lg bg-gray-50 pb-8 pl-8 pr-0 pt-8 text-right lg:static lg:flex lg:flex-row lg:rounded-none lg:bg-transparent lg:shadow-none dark:bg-gray-950`}
      >
        {config.navigation.map((item) => (
          <Link
            className="text-xl lg:hover:underline"
            key={item.name}
            href={item.url}
            onClick={handleLinkClick}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
