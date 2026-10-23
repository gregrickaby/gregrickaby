'use client'

import { type MouseEvent, type ReactNode, useState } from 'react'
import { playSound } from './sounds'

const COPIED_FOR = 2000

/**
 * Copies a code block when its `[data-copy]` button, added at build time, is
 * clicked. The button shows a check for a moment, and a status line tells
 * screen readers. Without JavaScript, CSS hides the buttons.
 */
export function CodeCopy({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState('')

  async function copy(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy]')
    const code = button?.closest('figure')?.querySelector('code')
    if (!button || !code) return
    try {
      await navigator.clipboard.writeText(code.textContent)
      button.dataset.copied = ''
      playSound('copy')
      setStatus('Copied to clipboard')
    } catch {
      setStatus('Could not copy')
    }
    setTimeout(() => {
      delete button.dataset.copied
      setStatus('')
    }, COPIED_FOR)
  }

  return (
    <div onClick={copy}>
      {children}
      <span className="visually-hidden" role="status">
        {status}
      </span>
    </div>
  )
}
