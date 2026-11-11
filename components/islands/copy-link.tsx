'use client'

import { useState } from 'react'

import { LinkIcon } from '@/components/icons'
import { playSound } from '@/components/islands/audio/sounds'

import styles from './copy-link.module.css'

const COPIED_FOR = 2000

/**
 * A share menu item that copies a post's URL, and says "Copied" in its place
 * for a moment. Hidden without JavaScript, since the reader can copy the
 * address bar instead.
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
      <button className={`${className} ${styles.button}`} onClick={copy} type="button">
        <LinkIcon size={20} />
        {status || 'Copy link'}
      </button>
      <span className="visually-hidden" role="status">
        {status}
      </span>
    </span>
  )
}
