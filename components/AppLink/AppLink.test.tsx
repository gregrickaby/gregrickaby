import {render, screen} from '@/test-utils'
import {AppLink} from './AppLink'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}))

describe('AppLink', () => {
  it('renders a link with the correct href', () => {
    render(<AppLink href="/about">About</AppLink>)
    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute(
      'href',
      '/about'
    )
  })

  it('renders children', () => {
    render(<AppLink href="/">Home</AppLink>)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('merges an additional className with the base style class', () => {
    render(
      <AppLink href="/" className="extra">
        Home
      </AppLink>
    )
    const link = screen.getByRole('link', {name: 'Home'})
    expect(link).toHaveClass('extra')
  })

  it('passes extra props through to the underlying link', () => {
    render(
      <AppLink
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        External
      </AppLink>
    )
    const link = screen.getByRole('link', {name: 'External'})
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
