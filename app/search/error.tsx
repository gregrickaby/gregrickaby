'use client'

import { ErrorNotice } from '@/components/islands/error-notice'

/** Errors below this layout render inside its site shell. */
export default function ErrorPage(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorNotice {...props} />
}
