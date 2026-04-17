// vi.hoisted() ensures mocks are initialised before vi.mock() factories run,
// which in turn are hoisted above the static import of the route module.
const {mockLogger, mockProxyHandler, mockCreateProxyRouteHandler} = vi.hoisted(
  () => {
    const mockProxyHandler = vi.fn()
    const mockLogger = {}
    return {
      mockLogger,
      mockProxyHandler,
      mockCreateProxyRouteHandler: vi.fn().mockReturnValue(mockProxyHandler)
    }
  }
)

vi.mock('@/lib/axiom/server', () => ({
  logger: mockLogger
}))

vi.mock('@axiomhq/nextjs', () => ({
  createProxyRouteHandler: mockCreateProxyRouteHandler
}))

import {POST} from './route'

describe('POST /api/axiom', () => {
  it('exports a POST handler returned by createProxyRouteHandler', () => {
    expect(POST).toBe(mockProxyHandler)
  })

  it('passes the logger to createProxyRouteHandler', () => {
    expect(mockCreateProxyRouteHandler).toHaveBeenCalledWith(mockLogger)
  })

  it('calls createProxyRouteHandler exactly once at module initialisation', () => {
    expect(mockCreateProxyRouteHandler).toHaveBeenCalledOnce()
  })
})
