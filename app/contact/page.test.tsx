import {render, screen} from '@/test-utils'

vi.mock('@/app/contact/actions', () => ({
  sendContactEmail: vi.fn(),
  INITIAL_STATE: {success: false, error: null}
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
        title: 'Contact',
        slug: 'contact',
        date: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        type: 'page',
        description: 'Use the form on this page to get in touch.'
      },
      content: ''
    })
  }
})

describe('Contact page', () => {
  it('renders the Contact heading', async () => {
    const {default: ContactPage} = await import('./page')
    const result = await ContactPage()
    render(result)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Contact'})
    ).toBeInTheDocument()
  })

  it('renders the contact form', async () => {
    const {default: ContactPage} = await import('./page')
    const result = await ContactPage()
    render(result)
    expect(
      screen.getByRole('button', {name: /send message/i})
    ).toBeInTheDocument()
  })

  it('calls notFound when the page does not exist', async () => {
    const {getPageBySlug} = await import('@/lib/content')
    vi.mocked(getPageBySlug).mockResolvedValueOnce(null)
    const {notFound} = await import('next/navigation')
    const {default: ContactPage} = await import('./page')
    try {
      await ContactPage()
    } catch {
      // notFound may throw
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('generates metadata for the contact page', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata).toMatchObject({title: 'Contact'})
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
