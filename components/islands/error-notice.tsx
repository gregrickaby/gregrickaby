'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { addNextjsError } from '@datadog/browser-rum-nextjs'

import styles from './error-notice.module.css'

/**
 * What the error boundaries show: reports the error to RUM, then offers a
 * reload and a way home. A full reload, since the pages are prerendered: a
 * re-render repeats the same failure, and a fresh load also picks up new
 * chunks after a deploy.
 */
export function ErrorNotice({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => addNextjsError(error), [error])

  return (
    <div className={styles.error}>
      <h1 className={styles.title}>Couldn&apos;t load this page</h1>
      <p className={styles.lede}>Something broke on my end. A fresh reload sometimes fixes it.</p>
      <div className={styles.actions}>
        <button className={styles.reload} onClick={() => window.location.reload()} type="button">
          Reload the page
        </button>
        <Link className={styles.home} href="/">
          Back to the home page
        </Link>
      </div>
    </div>
  )
}
