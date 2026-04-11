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
    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute(
      'href',
      '/about'
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
    screen.getByRole('link', {name: 'About'}).click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
