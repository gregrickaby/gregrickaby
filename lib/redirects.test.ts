import redirects from './redirects'

describe('redirects', () => {
  it('places the date-based catch-all last', () => {
    const catchAllIndex = redirects.findIndex((r) =>
      r.source.includes('20[0-9]{2}')
    )
    expect(catchAllIndex).toBe(redirects.length - 1)
  })

  it('places specific WordPress date-based redirects before the catch-all', () => {
    const catchAllIndex = redirects.findIndex((r) =>
      r.source.includes('20[0-9]{2}')
    )
    const specificDateRedirectIndex = redirects.findIndex(
      (r) =>
        r.source === '/2011/05/how-to-install-lamp-on-ubuntu-1104-natty.html'
    )
    expect(specificDateRedirectIndex).toBeGreaterThanOrEqual(0)
    expect(specificDateRedirectIndex).toBeLessThan(catchAllIndex)
  })

  it('has no duplicate source paths', () => {
    const sources = redirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('marks every redirect as permanent', () => {
    expect(redirects.every((r) => r.permanent)).toBe(true)
  })
})
