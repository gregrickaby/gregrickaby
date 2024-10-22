import {Footer} from '@/components/Footer'
import {render, screen} from '@testing-library/react'
import {axe} from 'jest-axe'
import {vi} from 'vitest'

/**
 * Mock the <SocialLinks> component.
 */
vi.mock('@/components/SocialLinks', () => ({
  SocialLinks: function DummySocialLinks() {
    return <div data-testid="social-links"></div>
  }
}))

/**
 * Test suite for the Footer component.
 */
describe('Footer', () => {
  it('should render', () => {
    render(<Footer />)
    const footer = screen.getByTestId('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render the SocialLinks component', () => {
    render(<Footer />)
    const socialLinks = screen.getByTestId('social-links')
    expect(socialLinks).toBeInTheDocument()
  })

  it('should display the correct copyright year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© 2008 - ${currentYear} Greg Rickaby ✌️`)
    ).toBeInTheDocument()
  })

  it('should display the correct license information', () => {
    render(<Footer />)
    const licenseLink = screen.getByRole('link', {
      name: /CC BY-NC-ND 4.0/i
    })
    expect(licenseLink).toBeInTheDocument()
    expect(licenseLink).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-nc-nd/4.0/'
    )
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    render(<Footer />)
    const footer = screen.getByTestId('footer')
    expect(footer).toMatchSnapshot()
  })
})
