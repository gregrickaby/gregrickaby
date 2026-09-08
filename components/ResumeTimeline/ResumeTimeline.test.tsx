import {render, screen} from '@/test-utils'
import {ResumeTimeline} from './ResumeTimeline'

describe('ResumeTimeline', () => {
  it('renders the page heading', () => {
    render(<ResumeTimeline />)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Resume'})
    ).toBeInTheDocument()
  })

  it('renders a timeline entry for every role', () => {
    render(<ResumeTimeline />)
    expect(
      screen.getByRole('heading', {level: 3, name: /Mindsize/})
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {level: 3, name: /WPForms\.com/})
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Webmaster.*Midwest Communications/
      })
    ).toBeInTheDocument()
  })

  it('links a company name to its website when available', () => {
    render(<ResumeTimeline />)
    expect(screen.getByRole('link', {name: 'Mindsize'})).toHaveAttribute(
      'href',
      'https://mindsize.com'
    )
  })

  it('does not link a company without a known website', () => {
    render(<ResumeTimeline />)
    expect(
      screen.queryByRole('link', {name: 'WPForms.com'})
    ).not.toBeInTheDocument()
  })

  it('renders role highlights', () => {
    render(<ResumeTimeline />)
    expect(
      screen.getByText(/Lead and mentor an agile team/)
    ).toBeInTheDocument()
  })

  it('links out to LinkedIn and GitHub', () => {
    render(<ResumeTimeline />)
    expect(screen.getByRole('link', {name: 'LinkedIn'})).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/gregrickaby/'
    )
    expect(screen.getByRole('link', {name: 'GitHub'})).toHaveAttribute(
      'href',
      'https://github.com/gregrickaby'
    )
  })

  it('renders the other experience section', () => {
    render(<ResumeTimeline />)
    expect(
      screen.getByRole('heading', {level: 2, name: 'Other Experience'})
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {level: 3, name: 'Author'})
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {level: 3, name: 'Contributor'})
    ).toBeInTheDocument()
  })
})
