'use client'

import { useState } from 'react'

import { MarkdownIcon } from '@/components/icons'

import styles from './copy-markdown.module.css'
import { playSound } from './sounds'

const COPIED_FOR = 2000

/**
 * An icon that copies a post's Markdown from `/<slug>.md`, for pasting into a
 * chat or an editor. The file loads on click, so the page doesn't carry a
 * second copy of the post. Without JavaScript, CSS swaps the button for a
 * link to the file. `data-tip` holds the tooltip text for the caller's styles.
 */
export function CopyMarkdown({ className, slug }: { className: string; slug: string }) {
  const [status, setStatus] = useState('')
  const href = `/${slug}.md`

  async function copy() {
    // Safari only allows a clipboard write that starts in the click, so the fetch goes in as a promise.
    const text = fetch(href).then(async (response) => {
      if (!response.ok) throw new Error(`${href} returned ${response.status}`)
      return new Blob([await response.text()], { type: 'text/plain' })
    })
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text })])
      playSound('select')
      setStatus('Copied')
    } catch {
      setStatus('Could not copy')
    }
    setTimeout(() => setStatus(''), COPIED_FOR)
  }

  return (
    <span className={styles.copy}>
      <a
        aria-label="View as Markdown"
        className={`${className} ${styles.link}`}
        data-tip="View as Markdown"
        href={href}
      >
        <MarkdownIcon size={22} />
      </a>
      <button
        aria-label="Copy as Markdown"
        className={`${className} ${styles.button}`}
        data-copied={status ? '' : undefined}
        data-tip={status || 'Copy as Markdown'}
        onClick={copy}
        type="button"
      >
        <MarkdownIcon size={22} />
      </button>
      <span className="visually-hidden" role="status">
        {status}
      </span>
    </span>
  )
}
