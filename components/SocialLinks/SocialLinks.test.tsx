import {SocialLinks} from '@/components/SocialLinks'
import {render, screen} from '@testing-library/react'
import {axe} from 'jest-axe'

/**
 * Test suite for the SocialLinks component.
 */
describe('SocialLinks', () => {
  it('should render', () => {
    render(<SocialLinks />)
    const socialLinks = screen.getByTestId('social-links')
    expect(socialLinks).toBeInTheDocument()
  })

  it('should not have accessibility violations', async () => {
    const {container} = render(<SocialLinks />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    render(<SocialLinks />)
    const socialLinks = screen.getByTestId('social-links')
    expect(socialLinks).toMatchSnapshot()
  })
})
