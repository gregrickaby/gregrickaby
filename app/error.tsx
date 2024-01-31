'use client'

import {useEffect} from 'react'

interface ErrorProps {
  error: Error & {digest?: string}
  reset: () => void
}

/**
 * Error component.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function Error({error, reset}: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
