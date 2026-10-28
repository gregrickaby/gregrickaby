import { afterEach, describe, expect, it, vi } from 'vitest'

const { logsInit, nextjsPlugin, rumInit } = vi.hoisted(() => ({
  logsInit: vi.fn(),
  nextjsPlugin: vi.fn(() => ({ name: 'nextjs' })),
  rumInit: vi.fn(),
}))

vi.mock('@datadog/browser-logs', () => ({ datadogLogs: { init: logsInit } }))
vi.mock('@datadog/browser-rum-slim', () => ({ datadogRum: { init: rumInit } }))
vi.mock('@datadog/browser-rum-nextjs', () => ({ nextjsPlugin, onRouterTransitionStart: vi.fn() }))

interface RumOptions {
  beforeSend: (event: {
    type: string
    error?: { message?: string; resource?: { status_code?: number; url?: string } }
  }) => boolean
  plugins: unknown[]
  version?: string
}

interface LogsOptions {
  beforeSend: (log: {
    status?: string
    message?: string
    http?: { status_code?: number; url?: string }
  }) => boolean
}

const CONFIGURED = {
  DD_APPLICATION_ID: 'app-id',
  DD_CLIENT_TOKEN: 'client-token',
  DD_SITE: 'us5.datadoghq.com',
  DD_SERVICE: 'gregrickaby',
  DD_ENV: 'production',
  DD_VERSION: 'abc123',
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  logsInit.mockReset()
  nextjsPlugin.mockClear()
  rumInit.mockReset()
})

async function loadClient(env: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
  return import('@/instrumentation-client')
}

describe('browser RUM', () => {
  it('stays off without an application ID and client token', async () => {
    await loadClient({ DD_APPLICATION_ID: '', DD_CLIENT_TOKEN: '' })
    expect(rumInit).not.toHaveBeenCalled()
    expect(logsInit).not.toHaveBeenCalled()
  })

  it('initializes RUM and logs with the deploy version', async () => {
    await loadClient(CONFIGURED)
    expect(rumInit).toHaveBeenCalledOnce()
    expect(logsInit).toHaveBeenCalledOnce()

    const rum = rumInit.mock.calls[0]![0] as RumOptions
    expect(rum).toMatchObject({
      applicationId: 'app-id',
      clientToken: 'client-token',
      service: 'gregrickaby',
      env: 'production',
      sessionSampleRate: 100,
      trackResources: false,
      trackUserInteractions: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      traceSampleRate: 100,
      version: 'abc123',
    })
    expect(rum.plugins).toEqual([{ name: 'nextjs' }])
    expect(logsInit.mock.calls[0]![0]).toMatchObject({ forwardErrorsToLogs: true })
  })

  it('drops cancelled RSC prefetches from RUM', async () => {
    await loadClient(CONFIGURED)
    const { beforeSend } = rumInit.mock.calls[0]![0] as RumOptions
    const cancelled = {
      type: 'error',
      error: { resource: { status_code: 0, url: 'https://gregrickaby.com/blog?a=1&_rsc=xyz' } },
    }
    expect(beforeSend(cancelled)).toBe(false)
    expect(beforeSend({ type: 'error', error: { resource: { status_code: 500 } } })).toBe(true)
    expect(beforeSend({ type: 'error', error: {} })).toBe(true)
    expect(beforeSend({ type: 'view' })).toBe(true)
  })

  it('drops cancelled RSC prefetches from browser logs', async () => {
    await loadClient(CONFIGURED)
    const { beforeSend } = logsInit.mock.calls[0]![0] as LogsOptions
    expect(beforeSend({ status: 'error', http: { status_code: 0, url: '/blog?_rsc=xyz' } })).toBe(
      false,
    )
    expect(beforeSend({ status: 'error', http: { status_code: 500 } })).toBe(true)
    expect(beforeSend({ status: 'error' })).toBe(true)
    expect(beforeSend({ status: 'info' })).toBe(true)
  })
  it('drops the ResizeObserver loop notice from RUM and browser logs', async () => {
    await loadClient(CONFIGURED)
    const rum = (rumInit.mock.calls[0]![0] as RumOptions).beforeSend
    const logs = (logsInit.mock.calls[0]![0] as LogsOptions).beforeSend
    const message = 'ResizeObserver loop completed with undelivered notifications.'
    expect(rum({ type: 'error', error: { message } })).toBe(false)
    expect(rum({ type: 'error', error: { message: 'TypeError: x is undefined' } })).toBe(true)
    expect(logs({ status: 'error', message: `Uncaught "${message}"` })).toBe(false)
    expect(logs({ status: 'info', message })).toBe(true)
    expect(logs({ status: 'error', message: 'Failed to load chunk' })).toBe(true)
  })
})
