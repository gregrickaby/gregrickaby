'use client'

import ReactDOM from 'react-dom'

/**
 * Preload resources component.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#resource-hints
 */
export function PreloadResources() {
  ReactDOM.preload('/bg.jpg', {as: 'image'})
  return null
}
