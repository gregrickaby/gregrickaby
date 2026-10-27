'use client'

import { ErrorNotice } from '@/components/islands/error-notice'

/**
 * The fallback for errors the group boundaries can't catch: those in a group
 * layout itself, and in `/geocities`. It replaces the group layouts, so it has
 * no site shell, which can't come back here: its footer reads `lib/content`,
 * which is server-only.
 */
export default function ErrorPage(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main>
      <ErrorNotice {...props} />
    </main>
  )
}
