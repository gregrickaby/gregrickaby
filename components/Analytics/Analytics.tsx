'use client'

import Script from 'next/script'

interface AnalyticsProps {
  enabled: boolean
  scriptUrl?: string
  websiteId?: string
}

/**
 * Analytics script component (Umami).
 * Receives configuration from the root layout server component as props.
 */
export function Analytics({
  enabled,
  scriptUrl,
  websiteId
}: Readonly<AnalyticsProps>) {
  if (!enabled || !scriptUrl || !websiteId) {
    return null
  }

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}
