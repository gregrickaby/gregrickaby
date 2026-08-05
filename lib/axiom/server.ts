import 'server-only'

import axiomClient from '@/lib/axiom/axiom'
import {AxiomJSTransport, Logger} from '@axiomhq/logging'
import {createAxiomRouteHandler, nextJsFormatters} from '@axiomhq/nextjs'

/** Server-side Axiom logger. Never import this from a client component. */
export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom: axiomClient,
      dataset: process.env.AXIOM_DATASET!
    })
  ],
  formatters: nextJsFormatters
})

/** Route handler wrapper that reports unhandled errors and request logs to Axiom. */
export const withAxiom = createAxiomRouteHandler(logger)
