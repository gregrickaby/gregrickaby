import {toHaveNoViolations} from 'jest-axe'
import {expect} from 'vitest'

/**
 * Import custom Jest DOM matcher.
 */
import '@testing-library/jest-dom'

/**
 * Extend expect function with the `toHaveNoViolations` function.
 */
expect.extend(toHaveNoViolations)
