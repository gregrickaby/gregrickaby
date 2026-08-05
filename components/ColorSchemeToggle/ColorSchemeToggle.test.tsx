import {render, screen, userEvent} from '@/test-utils'

const {mockToggleColorScheme} = vi.hoisted(() => ({
  mockToggleColorScheme: vi.fn()
}))

vi.mock('@mantine/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/core')>()
  return {
    ...actual,
    useMantineColorScheme: () => ({
      toggleColorScheme: mockToggleColorScheme,
      colorScheme: 'light',
      setColorScheme: vi.fn(),
      clearColorScheme: vi.fn()
    })
  }
})

describe('ColorSchemeToggle', () => {
  it('renders the toggle button', async () => {
    const {ColorSchemeToggle} = await import('./ColorSchemeToggle')
    render(<ColorSchemeToggle />)
    expect(
      screen.getByRole('button', {name: 'Toggle color scheme'})
    ).toBeInTheDocument()
  })

  it('toggles the color scheme on click', async () => {
    const {ColorSchemeToggle} = await import('./ColorSchemeToggle')
    const user = userEvent.setup()
    render(<ColorSchemeToggle />)
    const button = screen.getByRole('button', {name: 'Toggle color scheme'})
    await user.click(button)
    expect(mockToggleColorScheme).toHaveBeenCalledTimes(1)
  })
})
