'use client'

import { useState } from 'react'

import { LinkIcon } from '@/components/icons'

import styles from './copy-link.module.css'
import { playSound } from './sounds'

const COPIED_FOR = 2000

/**
 * An icon that copies a post's URL. Hidden without JavaScript, since the
 * reader can copy the address bar instead. `data-tip` holds the tooltip text
 * for the caller's styles.
 */
export function CopyLink({ className, url }: { className: string; url: string }) {
  const [status, setStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      playSound('select')
      setStatus('Copied')
    } catch {
      setStatus('Could not copy')
    }
    setTimeout(() => setStatus(''), COPIED_FOR)
  }

  return (
    <span className={styles.copy}>
      <button
        aria-label="Copy link"
        className={`${className} ${styles.button}`}
        data-copied={status ? '' : undefined}
        data-tip={status || 'Copy link'}
        onClick={copy}
        type="button"
      >
        <LinkIcon size={22} />
      </button>
      <span className="visually-hidden" role="status">
        {status}
      </span>
    </span>
  )
}
