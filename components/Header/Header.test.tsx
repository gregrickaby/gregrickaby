import {render, screen, userEvent} from '@/test-utils'
import {Header} from './Header'

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

vi.mock('next/image', () => ({
  default: ({src, alt, ...props}: {src: string; alt: string}) => (
    <img src={src} alt={alt} {...props} />
  )
}))

describe('Header', () => {
  it('renders the site name', () => {
    render(<Header />)
    expect(screen.getByText('Greg Rickaby')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute(
      'href',
      '/about'
    )
    expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute(
      'href',
      '/contact'
    )
    expect(screen.getByRole('link', {name: 'Fun Stuff'})).toHaveAttribute(
      'href',
      '/fun-stuff'
    )
    expect(screen.getByRole('link', {name: 'RSS'})).toHaveAttribute(
      'href',
      '/feed.xml'
    )
  })

  it('renders the site name as a link to home', () => {
    render(<Header />)
    const homeLink = screen.getByText('Greg Rickaby').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders the avatar image linking to home', () => {
    render(<Header />)
    const avatar = screen.getByAltText('Greg Rickaby')
    expect(avatar).toBeInTheDocument()
    expect(avatar.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders the color scheme toggle', () => {
    render(<Header />)
    expect(
      screen.getByRole('button', {name: 'Toggle color scheme'})
    ).toBeInTheDocument()
  })

  it('renders the mobile menu burger button', () => {
    render(<Header />)
    const buttons = screen.getAllByRole('button')
    // Burger is the button without an aria-label (Mantine Burger)
    const burger = buttons.find((b) =>
      b.classList.toString().includes('Burger')
    )
    expect(burger).toBeInTheDocument()
  })

  it('opens mobile drawer on burger click', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const buttons = screen.getAllByRole('button')
    const burger = buttons.find((b) =>
      b.classList.toString().includes('Burger')
    )!
    await user.click(burger)
    // Drawer should now contain nav links (duplicated from desktop nav)
    const aboutLinks = screen.getAllByRole('link', {name: 'About'})
    expect(aboutLinks.length).toBeGreaterThanOrEqual(2)
  })
})
