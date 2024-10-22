import {Navigation} from '@/components/Navigation'
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {axe} from 'jest-axe'

describe('Navigation', () => {
  it('should render', () => {
    const {container} = render(<Navigation />)
    expect(container).toBeInTheDocument()
  })

  it('should render navigation links', async () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    await userEvent.click(button)
    const links = screen.getAllByRole('link')

    // Verify the navigation links are rendered.
    links.forEach((link) => {
      expect(link).toBeInTheDocument()
    })
  })

  it('should toggle the hamburger menu', async () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    await userEvent.click(button)

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are visible.
    expect(navLinks).toHaveClass(/flex/i)

    // Close the menu.
    await userEvent.click(button)

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should close the menu when clicking on a link', async () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    await userEvent.click(button)

    // Get all links.
    const links = screen.getAllByRole('link')

    // Click the first link.
    await userEvent.click(links[0])

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should close the menu when clicking outside', async () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    await userEvent.click(button)

    // Click outside the menu.
    await userEvent.click(document.body)

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Navigation />)
    const button = screen.getByRole('button')

    await userEvent.click(button)

    let results
    await act(async () => {
      results = await axe(container)
    })
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    render(<Navigation />)
    const nav = screen.getByTestId('nav')
    expect(nav).toMatchSnapshot()
  })
})
