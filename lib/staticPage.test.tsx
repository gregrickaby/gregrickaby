import {render, screen} from '@/test-utils'
import {createStaticPage} from './staticPage'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}))

vi.mock('./content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./content')>()
  return {
    ...actual,
    getPageBySlug: vi.fn()
  }
})

const mockPage = {
  meta: {
    title: 'Test Page',
    slug: 'test-page',
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    type: 'page' as const,
    description: 'A test page.'
  },
  content: '<p>Test page content.</p>'
}

describe('createStaticPage()', () => {
  it('renders the page title and content when the page exists', async () => {
    const {getPageBySlug} = await import('./content')
    vi.mocked(getPageBySlug).mockResolvedValue(mockPage)
    const {Page} = createStaticPage('test-page')
    render(await Page())
    expect(
      screen.getByRole('heading', {level: 1, name: 'Test Page'})
    ).toBeInTheDocument()
    expect(screen.getByText('Test page content.')).toBeInTheDocument()
  })

  it('emits JSON-LD structured data for the page', async () => {
    const {getPageBySlug} = await import('./content')
    vi.mocked(getPageBySlug).mockResolvedValue(mockPage)
    const {Page} = createStaticPage('test-page')
    render(await Page())
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.innerHTML).toContain('"@type":"WebPage"')
  })

  it('calls notFound() when the page does not exist', async () => {
    const {getPageBySlug} = await import('./content')
    vi.mocked(getPageBySlug).mockResolvedValue(null)
    const {notFound} = await import('next/navigation')
    const {Page} = createStaticPage('missing-page')
    try {
      await Page()
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('returns metadata built from the page when it exists', async () => {
    const {getPageBySlug} = await import('./content')
    vi.mocked(getPageBySlug).mockResolvedValue(mockPage)
    const {generateMetadata} = createStaticPage('test-page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata.title).toBe('Test Page')
    expect(metadata.alternates?.canonical).toBe('/test-page')
  })

  it('returns empty metadata when the page does not exist', async () => {
    const {getPageBySlug} = await import('./content')
    vi.mocked(getPageBySlug).mockResolvedValue(null)
    const {generateMetadata} = createStaticPage('missing-page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata).toEqual({})
  })
})
