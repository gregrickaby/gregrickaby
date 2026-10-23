'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useRef } from 'react'
import { MenuIcon } from '@/components/icons'
import styles from './mobile-menu.module.css'

/**
 * The small-screen menu. It is a native popover, so it opens, closes on Escape
 * or an outside click, and works without JavaScript. This island only closes
 * it after a client-side navigation, which keeps the header mounted.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current?.matches(':popover-open')) ref.current.hidePopover()
  }, [pathname])

  return (
    <>
      <button
        aria-label="Open navigation menu"
        className={styles.button}
        data-boop="spread"
        popoverTarget="site-menu"
        type="button"
      >
        <MenuIcon />
      </button>
      <div className={styles.panel} id="site-menu" popover="auto" ref={ref}>
        {children}
      </div>
    </>
  )
}
