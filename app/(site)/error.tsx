'use client'

import { ErrorNotice } from '@/components/islands/error-notice'

/** Errors below this layout render inside its site shell. */
export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  return <ErrorNotice error={error} />
}
