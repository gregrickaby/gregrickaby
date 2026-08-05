describe('headers', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalEnv ?? 'test')
    vi.resetModules()
  })

  function getCspValue(headers: (typeof import('./headers'))['default']) {
    return headers[0].headers.find((h) => h.key === 'Content-Security-Policy')
      ?.value
  }

  it("includes 'unsafe-eval' in development", async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.resetModules()
    const {default: headers} = await import('./headers')
    expect(getCspValue(headers)).toContain("'unsafe-eval'")
  })

  it("excludes 'unsafe-eval' in production", async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    const {default: headers} = await import('./headers')
    expect(getCspValue(headers)).not.toContain("'unsafe-eval'")
  })

  it('sets long-lived caching on static asset paths', async () => {
    vi.resetModules()
    const {default: headers} = await import('./headers')
    const assetRule = headers[1]
    expect(assetRule.headers[0]).toEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable'
    })
  })
})
