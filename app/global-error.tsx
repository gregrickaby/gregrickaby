'use client'

import { useEffect } from 'react'
import { addNextjsError } from '@datadog/browser-rum-nextjs'

/*
 * The last-resort page. It replaces the root layout, so the site's fonts,
 * tokens, and CSS are not loaded; the inline styles follow the OS color scheme
 * instead.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => addNextjsError(error), [error])

  return (
    <html lang="en" style={{ colorScheme: 'light dark' }}>
      <body
        style={{
          background: 'Canvas',
          color: 'CanvasText',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
        }}
      >
        <title>Couldn&apos;t load this page - Greg Rickaby</title>
        <main style={{ margin: '0 auto', maxWidth: '40rem', padding: '4rem 1rem' }}>
          <h1>Couldn&apos;t load this page</h1>
          <p>Trying again usually works.</p>
          <button
            onClick={() => retry()}
            style={{
              background: 'Canvas',
              border: '1px solid GrayText',
              borderRadius: '999px',
              color: 'CanvasText',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 600,
              padding: '0.5rem 1rem',
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
