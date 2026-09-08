import {render, screen} from '@/test-utils'
import {NavLinks} from './NavLinks'

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

describe('NavLinks', () => {
  it('renders all navigation links', () => {
    render(<NavLinks />)
    expect(screen.getByRole('link', {name: 'Blog'})).toHaveAttribute(
      'href',
      '/blog'
    )
    expect(screen.getByRole('link', {name: 'Resume'})).toHaveAttribute(
      'href',
      '/resume'
    )
    expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute(
      'href',
      '/contact'
    )
  })

  it('applies the correct styles to each link', () => {
    render(<NavLinks />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link.className).toContain('navLink')
    }
  })

  it('calls onClick when a link is clicked', async () => {
    const handleClick = vi.fn()
    render(<NavLinks onClick={handleClick} />)
    screen.getByRole('link', {name: 'Blog'}).click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('opens external links in a new tab with noopener noreferrer', () => {
    render(<NavLinks />)
    const rssLink = screen.getByRole('link', {name: 'RSS'})
    expect(rssLink).toHaveAttribute('target', '_blank')
    expect(rssLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not open internal links in a new tab', () => {
    render(<NavLinks />)
    const blogLink = screen.getByRole('link', {name: 'Blog'})
    expect(blogLink).not.toHaveAttribute('target', '_blank')
  })
})
