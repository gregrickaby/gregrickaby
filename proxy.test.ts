import type {NextFetchEvent, NextRequest} from 'next/server'

const {mockFlush, mockInfo, mockTransformMiddlewareRequest, mockNext} =
  vi.hoisted(() => ({
    mockFlush: vi.fn().mockResolvedValue(undefined),
    mockInfo: vi.fn(),
    mockTransformMiddlewareRequest: vi.fn().mockReturnValue(['log-message']),
    mockNext: vi.fn().mockReturnValue({type: 'next'})
  }))

vi.mock('@/lib/axiom/server', () => ({
  logger: {
    info: mockInfo,
    flush: mockFlush
  }
}))

vi.mock('@axiomhq/nextjs', () => ({
  transformMiddlewareRequest: mockTransformMiddlewareRequest
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNext
  }
}))

import {config, proxy} from './proxy'

/**
 * Build a minimal NextRequest stand-in for a given pathname.
 *
 * @param pathname - The URL pathname to simulate.
 * @returns A cast NextRequest object.
 */
function makeRequest(pathname: string): NextRequest {
  return {nextUrl: {pathname}} as unknown as NextRequest
}

/**
 * Build a minimal NextFetchEvent stand-in with a spy on waitUntil.
 *
 * @returns A cast NextFetchEvent object.
 */
function makeEvent(): NextFetchEvent {
  return {waitUntil: vi.fn()} as unknown as NextFetchEvent
}

describe('proxy()', () => {
  beforeEach(() => {
    mockInfo.mockClear()
    mockFlush.mockClear()
    mockNext.mockClear()
    mockTransformMiddlewareRequest.mockClear()
  })

  it('returns NextResponse.next() for a regular path', async () => {
    const result = await proxy(makeRequest('/about'), makeEvent())
    expect(mockNext).toHaveBeenCalledOnce()
    expect(result).toEqual({type: 'next'})
  })

  it('passes the request to transformMiddlewareRequest', async () => {
    const request = makeRequest('/blog/post')
    await proxy(request, makeEvent())
    expect(mockTransformMiddlewareRequest).toHaveBeenCalledWith(request)
  })

  it('forwards transformed args to logger.info for a non-noise route', async () => {
    await proxy(makeRequest('/blog/post'), makeEvent())
    expect(mockInfo).toHaveBeenCalledWith('log-message')
  })

  it('calls logger.flush for a non-noise route', async () => {
    await proxy(makeRequest('/blog/post'), makeEvent())
    expect(mockFlush).toHaveBeenCalledOnce()
  })

  it('registers the flush promise with event.waitUntil', async () => {
    const flushPromise = Promise.resolve()
    mockFlush.mockReturnValueOnce(flushPromise)
    const event = makeEvent()
    await proxy(makeRequest('/about'), event)
    const {waitUntil} = event as unknown as {
      waitUntil: ReturnType<typeof vi.fn>
    }
    expect(waitUntil).toHaveBeenCalledWith(flushPromise)
  })

  it('skips logging for /api/healthcheck', async () => {
    await proxy(makeRequest('/api/healthcheck'), makeEvent())
    expect(mockInfo).not.toHaveBeenCalled()
    expect(mockFlush).not.toHaveBeenCalled()
  })

  it('skips logging for a nested /api/healthcheck path', async () => {
    await proxy(makeRequest('/api/healthcheck/status'), makeEvent())
    expect(mockInfo).not.toHaveBeenCalled()
    expect(mockFlush).not.toHaveBeenCalled()
  })

  it('skips logging for /api/axiom', async () => {
    await proxy(makeRequest('/api/axiom'), makeEvent())
    expect(mockInfo).not.toHaveBeenCalled()
    expect(mockFlush).not.toHaveBeenCalled()
  })

  it('skips logging for a nested /api/axiom path', async () => {
    await proxy(makeRequest('/api/axiom/ingest'), makeEvent())
    expect(mockInfo).not.toHaveBeenCalled()
    expect(mockFlush).not.toHaveBeenCalled()
  })

  it('still returns NextResponse.next() when event is null', async () => {
    const result = await proxy(
      makeRequest('/about'),
      null as unknown as NextFetchEvent
    )
    expect(result).toEqual({type: 'next'})
    expect(mockFlush).toHaveBeenCalledOnce()
  })

  it('does not call waitUntil when event is null', async () => {
    // Should not throw — the else branch voids the promise instead.
    await expect(
      proxy(makeRequest('/about'), null as unknown as NextFetchEvent)
    ).resolves.toBeDefined()
  })
})

describe('config', () => {
  it('exports a single matcher entry', () => {
    expect(config.matcher).toHaveLength(1)
  })

  it('matcher excludes _next/static paths', () => {
    expect(config.matcher[0]).toContain('_next/static')
  })

  it('matcher excludes _next/image paths', () => {
    expect(config.matcher[0]).toContain('_next/image')
  })

  it('matcher excludes favicon.ico', () => {
    expect(config.matcher[0]).toContain('favicon.ico')
  })

  it('matcher excludes common image file extensions', () => {
    expect(config.matcher[0]).toContain('svg|png|jpg|jpeg|gif|webp')
  })
})
