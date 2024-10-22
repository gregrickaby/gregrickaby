import {JsonLD} from '@/components/JsonLd'
import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

/**
 * Test suite for the JsonLd component.
 */
describe('JsonLD', () => {
  it('should render', () => {
    render(<JsonLD />)
    const jsonLd = screen.getByTestId('json-ld')
    expect(jsonLd).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    render(<JsonLD />)
    const jsonLd = screen.getByTestId('json-ld')
    expect(jsonLd).toMatchSnapshot()
  })
})
