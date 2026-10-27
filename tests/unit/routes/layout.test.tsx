import { describe, expect, it, vi } from 'vitest'

import { contentIndex } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

vi.mock('@/.generated/content.json', () => ({ default: contentIndex() }))
vi.mock('next/font/google', () => {
  const font = (name: string) => () => ({ variable: `font-${name}` })
  return {
    Roboto: font('sans'),
    Roboto_Slab: font('serif'),
    Roboto_Mono: font('mono'),
    Silkscreen: font('pixel'),
  }
})
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@datadog/browser-rum-nextjs', () => ({
  DatadogAppRouter: () => <span data-datadog-router />,
}))
vi.mock('next/form', () => ({
  default: ({ children, ...props }: React.ComponentProps<'form'>) => (
    <form {...props}>{children}</form>
  ),
}))

const layout = await import('@/app/layout')

describe('root layout', () => {
  it('renders the document with fonts, theme script, and JSON-LD, leaving the frame to each page', async () => {
    const RootLayout = layout.default as (props: {
      children: React.ReactNode
    }) => React.ReactElement
    const html = await renderServer(<RootLayout>Page body</RootLayout>)
    expect(html).toContain('font-sans font-serif font-mono font-pixel')
    expect(html).toContain('data-theme="system"')
    expect(html).toContain('theme=(light|dark)')
    expect(html).toContain('"@type":"WebSite"')
    expect(html).not.toContain('href="#main"')
    expect(html).toContain('<body><span data-datadog-router="true"></span>Page body</body>')
  })

  it('sets site metadata', () => {
    expect(layout.metadata.metadataBase?.toString()).toBe('https://gregrickaby.com/')
    expect(layout.viewport.themeColor).toHaveLength(2)
  })
})
