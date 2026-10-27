import type { Instrumentation } from 'next'

const HEARTBEAT_MS = 15 * 60 * 1000

/**
 * A log entry every 15 minutes, so a log monitor can tell an intake key that
 * stopped working from a quiet site. `unref` keeps the timer from holding the
 * process open.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { logger } = await import('@/lib/datadog/server')
  setInterval(() => logger.info('Heartbeat'), HEARTBEAT_MS).unref()
}

/**
 * Server errors Next catches while rendering, in route handlers, and in server
 * actions. The Node runtime only, which is where all of this app's code runs.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { errorFields, logger } = await import('@/lib/datadog/server')
  const digest =
    typeof error === 'object' && error !== null && 'digest' in error
      ? String(error.digest)
      : undefined
  // The path can carry a query string; Datadog gets the path alone.
  const path = request.path.split('?')[0]
  logger.error(error instanceof Error ? error.message : 'Unhandled request error', {
    ...errorFields(error),
    digest,
    request: { method: request.method, path },
    context,
  })
}
