import JsonLD from '@/components/JsonLd'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

/**
 * Test suite for the JsonLd component.
 */
describe('JsonLD', () => {
  it('should render', () => {
    const {getByTestId} = render(<JsonLD />)
    const jsonLd = getByTestId('json-ld')
    expect(jsonLd).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<JsonLD />)
    const jsonLd = getByTestId('json-ld')
    expect(jsonLd).toMatchSnapshot()
  })
})
