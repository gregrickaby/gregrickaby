'use client'

import { useSyncExternalStore } from 'react'

import { ShareIcon } from '@/components/icons'

function subscribe() {
  return () => {}
}

/**
 * A share menu item that opens the device's own share sheet, where the
 * browser has one (most phones, Safari, and Edge). Nothing renders on the
 * server or where there's no sheet. A canceled share is not an error.
 */
export function DeviceShare({
  className,
  title,
  url,
}: {
  className: string
  title: string
  url: string
}) {
  const supported = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === 'function',
    () => false,
  )
  if (!supported) return null

  function share() {
    navigator.share({ title, url }).catch(() => {
      // The reader closed the sheet.
    })
  }

  return (
    <button className={className} onClick={share} type="button">
      <ShareIcon size={20} />
      More options
    </button>
  )
}
