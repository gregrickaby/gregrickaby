'use client'

import Script from 'next/script'

/**
 * Props for the Analytics component.
 *
 * @interface
 */
interface AnalyticsProps {
  /** Whether analytics is enabled. */
  enabled: boolean
  /** The analytics script URL. */
  scriptUrl?: string
  /** The website ID for analytics. */
  websiteId?: string
}

/**
 * Analytics script component (Umami).
 * Conditionally loads the analytics script based on the provided configuration.
 *
 * @param props - The props for the Analytics component.
 * @returns A React element with the analytics script, or null if not configured.
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
