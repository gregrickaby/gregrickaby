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
        title: 'Fun Stuff',
        slug: 'fun-stuff',
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'page',
        description: 'Fun things I enjoy.'
      },
      content: '<p>Fun stuff page content.</p>'
    })
  }
})

describe('Fun Stuff page', () => {
  it('renders the page title', async () => {
    const {default: FunStuffPage} = await import('./page')
    const result = await FunStuffPage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Fun Stuff'})
    ).toBeInTheDocument()
  })

  it('renders the page content', async () => {
    const {default: FunStuffPage} = await import('./page')
    const result = await FunStuffPage()
    render(result)
    expect(screen.getByText('Fun stuff page content.')).toBeInTheDocument()
  })

  it('calls notFound when the page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {notFound} = await import('next/navigation')
    const {default: FunStuffPage} = await import('./page')
    try {
      await FunStuffPage()
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
