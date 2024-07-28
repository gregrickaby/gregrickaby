import {Footer} from '@/components/Footer'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it, vi} from 'vitest'

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
    const {getByTestId} = render(<Footer />)
    const footer = getByTestId('footer')
    expect(footer).toBeInTheDocument()
  })

  it('should render the SocialLinks component', () => {
    const screen = render(<Footer />)
    const socialLinks = screen.getByTestId('social-links')
    expect(socialLinks).toBeInTheDocument()
  })

  it('should display the correct copyright year', () => {
    const {getByText} = render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(
      getByText(`© 2008 - ${currentYear} Greg Rickaby ✌️`)
    ).toBeInTheDocument()
  })

  it('should display the correct license information', () => {
    const screen = render(<Footer />)
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
    const {getByTestId} = render(<Footer />)
    const footer = getByTestId('footer')
    expect(footer).toMatchSnapshot()
  })
})
