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

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((key: string) => {
      if (key === 'x-pathname') return '/some-missing-page'
      if (key === 'x-http-method') return 'GET'
      if (key === 'user-agent') return 'TestAgent/1.0'
      return null
    })
  })
}))

describe('NotFound page', () => {
  it('renders the 404 heading', async () => {
    render(await NotFound())
    expect(
      screen.getByRole('heading', {level: 1, name: '404'})
    ).toBeInTheDocument()
  })

  it('displays a helpful message', async () => {
    render(await NotFound())
    expect(
      screen.getByText("The page you're looking for doesn't exist.")
    ).toBeInTheDocument()
  })

  it('has a link back to home', async () => {
    render(await NotFound())
    const link = screen.getByRole('link', {name: 'Go back home'})
    expect(link).toHaveAttribute('href', '/')
  })
})
