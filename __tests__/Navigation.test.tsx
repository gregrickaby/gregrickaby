import Navigation from '@/components/Navigation'
import config from '@/lib/config'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect, it} from 'vitest'

describe('Navigation', () => {
  it('should render', () => {
    const {container} = render(<Navigation />)
    expect(container).toBeInTheDocument()
  })

  it('it should render every link in the config', () => {
    const {getByTestId} = render(<Navigation />)
    const nav = getByTestId('nav')
    expect(nav.children.length).toBe(config.navigation.length)
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<Navigation />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<Navigation />)
    const footer = getByTestId('nav')
    expect(footer).toMatchSnapshot()
  })
})
