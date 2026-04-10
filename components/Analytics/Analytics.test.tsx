import {render, screen} from '@/test-utils'

vi.mock('next/script', () => ({
  default: vi.fn(({src, 'data-website-id': id, strategy}) => (
    <script
      data-testid="analytics-script"
      src={src}
      data-website-id={id}
      data-strategy={strategy}
    />
  ))
}))

describe('Analytics', () => {
  it('renders nothing when disabled', async () => {
    const {Analytics} = await import('./Analytics')
    render(
      <Analytics
        enabled={false}
        scriptUrl="https://example.com/script.js"
        websiteId="abc123"
      />
    )
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
  })

  it('renders nothing when scriptUrl is missing', async () => {
    const {Analytics} = await import('./Analytics')
    render(<Analytics enabled websiteId="abc123" />)
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
  })

  it('renders nothing when websiteId is missing', async () => {
    const {Analytics} = await import('./Analytics')
    render(<Analytics enabled scriptUrl="https://example.com/script.js" />)
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
  })

  it('renders the script tag when all props are provided', async () => {
    const {Analytics} = await import('./Analytics')
    render(
      <Analytics
        enabled
        scriptUrl="https://example.com/script.js"
        websiteId="abc123"
      />
    )
    const script = screen.getByTestId('analytics-script')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('src', 'https://example.com/script.js')
    expect(script).toHaveAttribute('data-website-id', 'abc123')
  })
})
