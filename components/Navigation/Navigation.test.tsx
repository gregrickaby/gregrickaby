import {Navigation} from '@/components/Navigation'
import config from '@/lib/config'
import '@testing-library/jest-dom'
import {act, fireEvent, render, screen} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it} from 'vitest'

describe('Navigation', () => {
  it('should render', () => {
    const {container} = render(<Navigation />)
    expect(container).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    act(() => {
      fireEvent.click(button)
    })

    // Get all links.
    const links = screen.getAllByRole('link')

    // Verify the number of links.
    expect(links.length).toBe(config.navigation.length)

    // Verify each link is in the DOM.
    links.forEach((link) => {
      expect(link).toBeInTheDocument()
    })
  })

  it('should toggle the hamburger menu', () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    act(() => {
      fireEvent.click(button)
    })

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are visible.
    expect(navLinks).toHaveClass(/flex/i)

    // Close the menu.
    act(() => {
      fireEvent.click(button)
    })

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should close the menu when clicking on a link', () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    act(() => {
      fireEvent.click(button)
    })

    // Get all links.
    const links = screen.getAllByRole('link')

    // Click the first link.
    act(() => {
      fireEvent.click(links[0])
    })

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should close the menu when clicking outside', () => {
    render(<Navigation />)
    const button = screen.getByRole('button')

    // Open the menu.
    act(() => {
      fireEvent.click(button)
    })

    // Click outside the menu.
    act(() => {
      fireEvent.mouseDown(document)
    })

    // Get the navigation links container.
    const navLinks = screen.getByTestId('nav-links')

    // Verify the navigation links are hidden.
    expect(navLinks).toHaveClass(/hidden/i)
  })

  it('should not have any accessibility issues', async () => {
    const {container, getByRole} = render(<Navigation />)
    const button = getByRole('button')

    // Open the menu.
    await act(async () => {
      fireEvent.click(button)
    })

    // Get the container.
    const results = await act(async () => {
      return await axe(container)
    })

    // Verify there are no violations.
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<Navigation />)
    const nav = getByTestId('nav')
    expect(nav).toMatchSnapshot()
  })
})
