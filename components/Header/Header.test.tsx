import {Header} from '@/components/Header'
import config from '@/lib/config'
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {axe} from 'jest-axe'

/**
 * Test suite for the Header component.
 */
describe('Header', () => {
  it('should render', () => {
    render(<Header />)
    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()
  })

  it('should render the logo', () => {
    render(<Header />)
    const logo = screen.getByAltText(config.siteName)
    expect(logo).toBeInTheDocument
  })

  it('should render the site name', () => {
    render(<Header />)
    const text = screen.getByText(config.siteName)
    expect(text).toBeInTheDocument()
  })

  it('should render the description text', () => {
    render(<Header />)
    const text = screen.getByText(config.siteDescription)
    expect(text).toBeInTheDocument
  })

  it('should not have accessibility issues', async () => {
    const {container} = render(<Header />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    const results = await act(async () => {
      return await axe(container)
    })

    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    render(<Header />)
    const header = screen.getByTestId('header')
    expect(header).toMatchSnapshot()
  })
})
