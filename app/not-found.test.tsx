import {render, screen} from '@/test-utils'
import NotFound from './not-found'

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

describe('NotFound page', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />)
    expect(
      screen.getByRole('heading', {level: 1, name: '404'})
    ).toBeInTheDocument()
  })

  it('displays a helpful message', () => {
    render(<NotFound />)
    expect(
      screen.getByText("The page you're looking for doesn't exist.")
    ).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', {name: 'Go back home'})
    expect(link).toHaveAttribute('href', '/')
  })
})
