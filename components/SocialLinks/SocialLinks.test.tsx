import {SocialLinks} from '@/components/SocialLinks'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it} from 'vitest'

/**
 * Test suite for the SocialLinks component.
 */
describe('SocialLinks', () => {
  it('should render', () => {
    const {getByTestId} = render(<SocialLinks />)
    const socialLinks = getByTestId('social-links')
    expect(socialLinks).toBeInTheDocument()
  })

  it('should not have accessibility violations', async () => {
    const {container} = render(<SocialLinks />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<SocialLinks />)
    const socialLinks = getByTestId('social-links')
    expect(socialLinks).toMatchSnapshot()
  })
})
