import {toHaveNoViolations} from 'jest-axe'

/**
 * Extend expect function with the `toHaveNoViolations` function.
 */
expect.extend(toHaveNoViolations)
