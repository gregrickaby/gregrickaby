import {sanitizeText} from '@/lib/functions/sanitizeText'
import {describe, expect, it} from 'vitest'

describe('sanitizeText', () => {
  it('should remove HTML tags and keep text content', () => {
    const input = 'Some title <b>20</b> to <i>24</i>'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe('Some title 20 to 24')
  })

  it('should decode HTML entities', () => {
    const input = 'Mary&apos;s Poppins Free Foo Bar'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe("Mary's Poppins Free Foo Bar")
  })

  it('should handle strings with no special characters correctly', () => {
    const input = 'Regular title'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe(input)
  })

  it('should return an empty string if input is empty', () => {
    const input = ''
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe('')
  })

  it('should remove script tags and their content', () => {
    const input = 'Safe text <script>alert("XSS")</script>'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe('Safe text ')
  })
})
