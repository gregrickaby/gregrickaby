import {render, screen} from '@/test-utils'
import {Footer} from './Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('renders the GitHub link', () => {
    render(<Footer />)
    const link = screen.getByRole('link', {name: 'GitHub'})
    expect(link).toHaveAttribute('href', 'https://github.com/gregrickaby')
  })

  it('renders the LinkedIn link', () => {
    render(<Footer />)
    const link = screen.getByRole('link', {name: 'LinkedIn'})
    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/gregrickaby/'
    )
  })

  it('renders the license text and CC BY-NC-ND 4.0 link', () => {
    render(<Footer />)
    expect(screen.getByText(/unless otherwise noted/i)).toBeInTheDocument()
    const ccLink = screen.getByRole('link', {name: 'CC BY-NC-ND 4.0'})
    expect(ccLink).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-nc-nd/4.0/'
    )
  })

  it('opens external links in new tab', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
  })
})
