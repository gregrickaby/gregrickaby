import {render, screen} from '@/test-utils'

vi.mock('@/app/contact/actions', () => ({
  sendContactEmail: vi.fn(),
  INITIAL_STATE: {success: false, error: null}
}))

describe('Contact page', () => {
  it('renders the Contact heading', async () => {
    const {default: ContactPage} = await import('./page')
    render(<ContactPage />)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Contact'})
    ).toBeInTheDocument()
  })

  it('renders the contact form', async () => {
    const {default: ContactPage} = await import('./page')
    render(<ContactPage />)
    expect(
      screen.getByRole('button', {name: /send message/i})
    ).toBeInTheDocument()
  })

  it('generates metadata', async () => {
    const {generateMetadata} = await import('./page')
    const metadata = await generateMetadata(
      {},
      Promise.resolve({openGraph: null}) as never
    )
    expect(metadata).toMatchObject({
      title: 'Contact',
      description: 'Use the form on this page to get in touch.'
    })
  })
})
