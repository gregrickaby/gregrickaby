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
        title: 'About Me',
        slug: 'about',
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'page',
        description: 'Learn more about me.'
      },
      content: '<p>This is the about page content.</p>'
    })
  }
})

describe('About page', () => {
  it('renders the page title', async () => {
    const {default: AboutPage} = await import('./page')
    const result = await AboutPage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'About Me'})
    ).toBeInTheDocument()
  })

  it('renders the page content', async () => {
    const {default: AboutPage} = await import('./page')
    const result = await AboutPage()
    render(result)
    expect(
      screen.getByText('This is the about page content.')
    ).toBeInTheDocument()
  })

  it('calls notFound when the page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {notFound} = await import('next/navigation')
    const {default: AboutPage} = await import('./page')
    try {
      await AboutPage()
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('returns empty metadata when the page does not exist', async () => {
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
