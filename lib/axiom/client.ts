'use client'

import {Logger, ProxyTransport} from '@axiomhq/logging'
import {createUseLogger, createWebVitalsComponent} from '@axiomhq/react'

/**
 * Client-side Axiom logger. Sends logs through the `/api/axiom` proxy route
 * so the AXIOM_TOKEN is never exposed to the browser.
 */
export const logger = new Logger({
  transports: [new ProxyTransport({url: '/api/axiom', autoFlush: true})]
})

/** React hook that returns a component-scoped logger bound to `logger`. */
const useLogger = createUseLogger(logger)

/** Component that reports Core Web Vitals to Axiom via `logger`. */
const WebVitals = createWebVitalsComponent(logger)

export {useLogger, WebVitals}
