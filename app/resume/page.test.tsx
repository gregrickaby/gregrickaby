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
        title: 'Resume',
        slug: 'resume',
        date: '2024-07-18T00:00:00Z',
        modified: '2025-12-03T00:00:00Z',
        type: 'page',
        description:
          'Learn more about my career history, side hustles and contributions to society.'
      },
      content: '<p>Resume content.</p>'
    })
  }
})

describe('Resume page', () => {
  it('renders the page title', async () => {
    const {default: ResumePage} = await import('./page')
    const result = await ResumePage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Resume'})
    ).toBeInTheDocument()
  })

  it('renders the resume timeline', async () => {
    const {default: ResumePage} = await import('./page')
    const result = await ResumePage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 3, name: /Mindsize/})
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {level: 2, name: 'Other Experience'})
    ).toBeInTheDocument()
  })

  it('emits JSON-LD structured data for the page', async () => {
    const {default: ResumePage} = await import('./page')
    const result = await ResumePage()
    render(result)
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script?.innerHTML).toContain('"@type":"WebPage"')
  })

  it('calls notFound when the page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {notFound} = await import('next/navigation')
    const {default: ResumePage} = await import('./page')
    try {
      await ResumePage()
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('sets the canonical path to /resume', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata.alternates?.canonical).toBe('/resume')
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
