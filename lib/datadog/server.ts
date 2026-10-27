import 'server-only'

import { after } from 'next/server'
import tracer from 'dd-trace'

/*
 * Structured server logs for Datadog's Logs Intake API. Plain `fetch`, so
 * route handlers and server actions can use it alike. Without `DD_API_KEY`,
 * or outside production, entries go to the console instead. No visitor IPs or
 * raw headers ever reach a log entry.
 */

type LogFields = Record<string, unknown>
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const DD_SITE = process.env.DD_SITE || 'us5.datadoghq.com'
const DD_SERVICE = process.env.DD_SERVICE || 'gregrickaby'
const DD_ENV = process.env.DD_ENV || 'production'
const DD_API_KEY = process.env.DD_API_KEY
const LOGS_URL = `https://http-intake.logs.${DD_SITE}/api/v2/logs`

/** The message and stack of a caught value, ready to add to a log entry. */
export function errorFields(error: unknown): { error: string; stack: string | undefined } {
  return {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  }
}

function toConsole(level: LogLevel, message: string, fields?: LogFields) {
  const write = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
  if (fields) {
    write(message, fields)
    return
  }
  write(message)
}

/**
 * `dd.trace_id` and `dd.span_id` of the active span, so Datadog links the
 * entry to its APM trace. The tracer adds these on its own only to loggers it
 * patches; this one posts over HTTP. Empty when nothing is traced (dev, tests,
 * or outside a request).
 */
function traceFields(): LogFields {
  const span = tracer.scope().active()
  if (!span) return {}
  const record: LogFields = {}
  tracer.inject(span.context(), 'log', record)
  return record
}

async function deliver(
  apiKey: string,
  level: LogLevel,
  message: string,
  fields?: LogFields,
): Promise<void> {
  try {
    await fetch(LOGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'DD-API-KEY': apiKey },
      body: JSON.stringify([
        {
          message,
          status: level,
          service: DD_SERVICE,
          ddsource: 'nextjs',
          ddtags: `env:${DD_ENV}`,
          ...fields,
        },
      ]),
    })
  } catch {
    // A logging failure must never break the request that triggered it.
  }
}

function send(level: LogLevel, message: string, fields?: LogFields): void {
  if (process.env.NODE_ENV !== 'production' || !DD_API_KEY) {
    toConsole(level, message, fields)
    return
  }
  // Read the span now: by the time `after` runs, the request's span has ended.
  const delivery = deliver(DD_API_KEY, level, message, { ...traceFields(), ...fields })
  try {
    // Keeps the process alive until the log is sent.
    after(delivery)
  } catch {
    // Outside a request (build, tests): the fetch is already running.
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => send('debug', message, fields),
  info: (message: string, fields?: LogFields) => send('info', message, fields),
  warn: (message: string, fields?: LogFields) => send('warn', message, fields),
  error: (message: string, fields?: LogFields) => send('error', message, fields),
}
