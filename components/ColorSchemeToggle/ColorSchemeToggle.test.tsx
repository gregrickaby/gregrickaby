import {render, screen, userEvent} from '@/test-utils'
import {ColorSchemeToggle} from './ColorSchemeToggle'

describe('ColorSchemeToggle', () => {
  it('renders the toggle button', () => {
    render(<ColorSchemeToggle />)
    expect(
      screen.getByRole('button', {name: 'Toggle color scheme'})
    ).toBeInTheDocument()
  })

  it('is clickable', async () => {
    const user = userEvent.setup()
    render(<ColorSchemeToggle />)
    const button = screen.getByRole('button', {name: 'Toggle color scheme'})
    await user.click(button)
    expect(button).toBeInTheDocument()
  })
})
