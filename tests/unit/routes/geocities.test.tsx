import { describe, expect, it, vi } from 'vitest'

import { renderServer } from '@/tests/helpers/render-server'

vi.mock('next/font/google', () => ({ Antonio: () => ({ variable: 'font-lcars' }) }))

const geocities = await import('@/app/geocities/page')

describe('geocities page', () => {
  it('renders the retro page in an LCARS frame without the site header', async () => {
    const html = await renderServer(<geocities.default />)
    expect(html).toContain('font-lcars')
    expect(html).toContain('Mr. Data, report...')
    expect(html).toContain('Library computer access and retrieval system')
    expect(html).toContain('href="/blog"')
    expect(html).toContain('Subspace comm')
    expect(html).not.toContain('Skip to content')
    expect(html).not.toContain('<audio')
  })

  it('prerenders and stays out of search engines', () => {
    expect(geocities.ensureStatic).toBe('navigation')
    expect(geocities.metadata.robots).toEqual({ index: false, follow: false })
  })
})
