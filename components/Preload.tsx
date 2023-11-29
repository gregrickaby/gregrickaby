'use client'

import ReactDOM from 'react-dom'

/**
 * Preload resources component.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#resource-hints
 */
export function Preload() {
  ReactDOM.preload('/bg_hdr.avif', {as: 'image'})
  return null
}
