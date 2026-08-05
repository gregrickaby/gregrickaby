import {render, screen} from '@/test-utils'
import {HeaderActions} from './HeaderActions'

describe('HeaderActions', () => {
  it('renders the search button', () => {
    render(<HeaderActions />)
    expect(screen.getByRole('button', {name: /search/i})).toBeInTheDocument()
  })

  it('renders the color scheme toggle button', () => {
    render(<HeaderActions />)
    expect(
      screen.getByRole('button', {name: 'Toggle color scheme'})
    ).toBeInTheDocument()
  })
})
