import { datadogLogs } from '@datadog/browser-logs'
import { nextjsPlugin } from '@datadog/browser-rum-nextjs'
import { datadogRum } from '@datadog/browser-rum-slim'

export { onRouterTransitionStart } from '@datadog/browser-rum-nextjs'

/* The values come from `next.config.ts`, which inlines them at build time. */
const applicationId = process.env.DD_APPLICATION_ID
const clientToken = process.env.DD_CLIENT_TOKEN

/** A cancelled RSC prefetch fails with status 0 and an `_rsc=` URL, but isn't an error. */
function isCancelledPrefetch(statusCode: number | undefined, url: string | undefined) {
  return statusCode === 0 && Boolean(url?.includes('_rsc='))
}

/**
 * Chrome reports a ResizeObserver whose callback resized what it watches as an
 * uncaught error with no stack. The site has no ResizeObserver, so it comes
 * from an extension or the browser, and the next frame delivers the change.
 */
function isResizeObserverLoop(message: string | undefined) {
  return Boolean(message?.includes('ResizeObserver loop'))
}

/** Headless and automated browsers would skew page speed numbers built from a few dozen views. */
function isBot() {
  return navigator.webdriver || /headless|bot|crawler|spider/i.test(navigator.userAgent)
}

// Both inits are no-ops until Coolify passes the RUM app's ID and token.
if (applicationId && clientToken && !isBot()) {
  const shared = {
    clientToken,
    site: process.env.DD_SITE,
    service: process.env.DD_SERVICE,
    env: process.env.DD_ENV,
    version: process.env.DD_VERSION || undefined,
  }

  datadogRum.init({
    ...shared,
    applicationId,
    // The slim SDK, so no session replay code is bundled: no DOM, text, or
    // input value is recorded.
    sessionSampleRate: 100,
    // Off: the photos page loads dozens of images, and each one would be an event.
    trackResources: false,
    trackUserInteractions: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    // Trace headers on the site's own requests (server actions, RSC payloads), so a
    // slow interaction in RUM links to its server trace in APM.
    allowedTracingUrls: [(url) => url.startsWith(window.location.origin)],
    traceSampleRate: 100,
    plugins: [nextjsPlugin()],
    beforeSend: (event) =>
      !(
        event.type === 'error' &&
        (isCancelledPrefetch(event.error.resource?.status_code, event.error.resource?.url) ||
          isResizeObserverLoop(event.error.message))
      ),
  })

  datadogLogs.init({
    ...shared,
    forwardErrorsToLogs: true,
    beforeSend: (log) =>
      !(
        log.status === 'error' &&
        (isCancelledPrefetch(log.http?.status_code, log.http?.url) ||
          isResizeObserverLoop(log.message))
      ),
  })
}
