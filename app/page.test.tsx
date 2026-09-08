import {render, screen} from '@/test-utils'

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

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>()
  return {
    ...actual,
    getPageBySlug: vi.fn().mockResolvedValue({
      meta: {
        title: 'About',
        slug: 'about',
        date: '2022-05-17T15:59:20Z',
        modified: '2026-09-08T00:00:00Z',
        type: 'page',
        description: 'Learn more about my work history and camera gear.'
      },
      content: '<p>About page content.</p>'
    })
  }
})

describe('Home page', () => {
  it('renders the about page title', async () => {
    const {default: HomePage} = await import('./page')
    const result = await HomePage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'About'})
    ).toBeInTheDocument()
  })

  it('renders the about page content', async () => {
    const {default: HomePage} = await import('./page')
    const result = await HomePage()
    render(result)
    expect(screen.getByText('About page content.')).toBeInTheDocument()
  })

  it('does not emit a WebPage JSON-LD graph (WebSite graph already covers home)', async () => {
    const {default: HomePage} = await import('./page')
    const result = await HomePage()
    render(result)
    expect(
      document.querySelector('script[type="application/ld+json"]')
    ).toBeNull()
  })

  it('calls notFound when the about page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {notFound} = await import('next/navigation')
    const {default: HomePage} = await import('./page')
    try {
      await HomePage()
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('sets the canonical path to the site root', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce({
      meta: {
        title: 'About',
        slug: 'about',
        date: '2022-05-17T15:59:20Z',
        modified: '2026-09-08T00:00:00Z',
        type: 'page'
      },
      content: '<p>About page content.</p>'
    })
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata.alternates?.canonical).toBe('/')
  })

  it('returns empty metadata when the about page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata).toEqual({})
  })
})
