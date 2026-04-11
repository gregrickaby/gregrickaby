import {render, screen, userEvent} from '@/test-utils'
import {MobileDrawer} from './MobileDrawer'

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

describe('MobileDrawer', () => {
  it('renders nav links when open', () => {
    render(<MobileDrawer opened onClose={vi.fn()} scrollY={0} />)
    expect(screen.getByRole('link', {name: 'About'})).toBeInTheDocument()
  })

  it('renders search and color scheme controls when open', () => {
    render(<MobileDrawer opened onClose={vi.fn()} scrollY={0} />)
    expect(screen.getByRole('button', {name: /search/i})).toBeInTheDocument()
    expect(
      screen.getByRole('button', {name: /toggle color scheme/i})
    ).toBeInTheDocument()
  })

  it('does not render nav links when closed', () => {
    render(<MobileDrawer opened={false} onClose={vi.fn()} scrollY={0} />)
    expect(screen.queryByRole('link', {name: 'About'})).not.toBeInTheDocument()
  })

  it('calls onClose when a nav link is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<MobileDrawer opened onClose={onClose} scrollY={0} />)
    await user.click(screen.getByRole('link', {name: 'About'}))
    expect(onClose).toHaveBeenCalled()
  })

  it('calculates drawer offset based on scroll position', () => {
    const {rerender} = render(
      <MobileDrawer opened onClose={vi.fn()} scrollY={0} />
    )
    // scrollY <= 50 → offset '73px'
    let content = document.querySelector('[style*="top"]') as HTMLElement | null
    expect(content?.style.top).toBe('73px')

    rerender(<MobileDrawer opened onClose={vi.fn()} scrollY={100} />)
    // scrollY > 50 → offset '60px'
    content = document.querySelector('[style*="top"]') as HTMLElement | null
    expect(content?.style.top).toBe('60px')
  })
})
