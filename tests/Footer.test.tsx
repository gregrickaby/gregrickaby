import Footer from '@/components/Footer'
import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'

/**
 * Mock the <SocialLinks> component.
 */
vi.mock('@/components/SocialLinks', () => ({
  default: function DummySocialLinks() {
    return <div data-testid="social-links"></div>
  }
}))

/**
 * Test suite for the Footer component.
 */
describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />)
  })

  test('renders the footer component', () => {
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeInTheDocument()
  })

  test('includes the SocialLinks component', () => {
    const socialLinksElement = screen.getByTestId('social-links')
    expect(socialLinksElement).toBeInTheDocument()
  })

  test('displays the correct copyright year', () => {
    const currentYear = new Date().getFullYear()
    expect(
      screen.getByText(`© 2008 - ${currentYear} Greg Rickaby`)
    ).toBeInTheDocument()
  })

  test('displays the correct license information', () => {
    const licenseLink = screen.getByRole('link', {
      name: /CC BY-NC-ND 4.0/i
    })
    expect(licenseLink).toBeInTheDocument()
    expect(licenseLink).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-nc-nd/4.0/'
    )
  })
})
