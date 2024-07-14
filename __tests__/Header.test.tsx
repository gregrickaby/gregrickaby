import Header from '@/components/Header'
import config from '@/lib/config'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it} from 'vitest'

/**
 * Test suite for the Header component.
 */
describe('Header', () => {
  it('should render', () => {
    const {getByTestId} = render(<Header />)
    const header = getByTestId('header')
    expect(header).toBeInTheDocument()
  })

  it('should render the logo', () => {
    const {getByAltText} = render(<Header />)
    const logo = getByAltText(config.siteName)
    expect(logo).toBeInTheDocument
  })

  it('should render the site name', () => {
    const {getByText} = render(<Header />)
    const text = getByText(config.siteName)
    expect(text).toBeInTheDocument()
  })

  it('should render the description text', () => {
    const {getByText} = render(<Header />)
    const text = getByText(config.siteDescription)
    expect(text).toBeInTheDocument
  })

  it('should not have accessibility issues', async () => {
    const {container} = render(<Header />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<Header />)
    const header = getByTestId('header')
    expect(header).toMatchSnapshot()
  })
})
