import {isExternalNavLink, siteConfig} from './config'

describe('isExternalNavLink()', () => {
  it('returns true for a nav link marked external', () => {
    const rss = siteConfig.nav.find((link) => link.label === 'RSS')!
    expect(isExternalNavLink(rss)).toBe(true)
  })

  it('returns false for a nav link with no external flag', () => {
    const resume = siteConfig.nav.find((link) => link.label === 'Resume')!
    expect(isExternalNavLink(resume)).toBe(false)
  })
})
