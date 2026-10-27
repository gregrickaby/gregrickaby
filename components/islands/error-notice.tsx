'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { addNextjsError } from '@datadog/browser-rum-nextjs'

import styles from './error-notice.module.css'

/** What the error boundaries show: reports the error to RUM, then offers a retry and a way home. */
export function ErrorNotice({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => addNextjsError(error), [error])

  return (
    <div className={styles.error}>
      <h1 className={styles.title}>Couldn&apos;t load this page</h1>
      <p className={styles.lede}>Trying again usually works.</p>
      <div className={styles.actions}>
        <button className={styles.retry} onClick={() => retry()} type="button">
          Try again
        </button>
        <Link className={styles.home} href="/">
          Back to the home page
        </Link>
      </div>
    </div>
  )
}
