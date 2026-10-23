'use client'

import type { MouseEvent } from 'react'

import { MoonIcon, SunIcon } from '@/components/icons'

import { playSound } from './sounds'
import styles from './theme-toggle.module.css'

/** Cookie the root layout's theme script reads before first paint. */
export const THEME_COOKIE = 'theme'

/**
 * Switches between light and dark. The choice lives in a cookie that the
 * root layout's inline script applies before paint, so pages stay static.
 * Without JavaScript the site follows the system setting.
 */
export function ThemeToggle() {
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement
    const current =
      root.dataset.theme === 'light' || root.dataset.theme === 'dark'
        ? root.dataset.theme
        : matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    playSound(next === 'dark' ? 'switch-off' : 'switch-on')
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    // Spins in the icon that appears. Cleared when the animation ends, so hover boops resume.
    event.currentTarget.dataset.switched = ''
  }

  return (
    <button
      className={styles.toggle}
      data-boop="theme"
      onAnimationEnd={(event) => delete event.currentTarget.dataset.switched}
      onClick={toggle}
      type="button"
    >
      <SunIcon className={styles.sun} />
      <MoonIcon className={styles.moon} />
      <span className={`visually-hidden ${styles.sun}`}>Switch to dark theme</span>
      <span className={`visually-hidden ${styles.moon}`}>Switch to light theme</span>
    </button>
  )
}
