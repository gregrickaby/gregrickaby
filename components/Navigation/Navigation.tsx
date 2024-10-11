'use client'

import config from '@/lib/config'
import {IconMenu, IconRss, IconSearch, IconX} from '@tabler/icons-react'
import clsx from 'clsx'
import Link from 'next/link'
import {MouseEvent, useEffect, useRef, useState} from 'react'
import styles from './Navigation.module.css'

/**
 * Navigation component.
 */
export function Navigation() {
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
    <nav ref={navRef} className={styles.nav} data-testid="nav">
      <div className={styles.navContainer}>
        <button
          aria-label="Toggle navigation"
          className={styles.navButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>
      <div
        className={clsx(
          styles.linkContainer,
          isOpen ? 'flex' : 'hidden',
          'xl:flex'
        )}
        data-testid="nav-links"
      >
        {config.navigation.map((item) => (
          <Link
            className={styles.link}
            href={item.url}
            key={item.name}
            onClick={handleLinkClick}
          >
            {item.name}
          </Link>
        ))}

        <div className={styles.icons}>
          <Link
            aria-label="rss feed"
            className={styles.icon}
            href="/feed.xml"
            onClick={handleLinkClick}
          >
            <IconRss size={24} stroke={2} />
          </Link>

          <Link
            aria-label="search"
            className={styles.icon}
            href="/search"
            onClick={handleLinkClick}
          >
            <IconSearch size={24} stroke={2} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
