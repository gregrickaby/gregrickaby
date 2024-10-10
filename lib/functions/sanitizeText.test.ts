import {describe, expect, it} from 'vitest'
import {sanitizeText} from './sanitizeText'

describe('sanitizeText', () => {
  it('should remove HTML tags and keep text content', () => {
    const input = 'Some title <b>20</b> to <i>24</i>'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe('Some title 20 to 24')
  })

  it('should decode HTML entities', () => {
    const input = 'Mary&apos;s &lt;Poppins Free&gt; Foo Bar'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe("Mary's <Poppins Free> Foo Bar")
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

  it('should handle multiple HTML entities and tags', () => {
    const input = '&lt;div&gt;Value&nbsp;&amp;&nbsp;More Value&lt;/div&gt;'
    const sanitized = sanitizeText(input)

    expect(sanitized).toBe('<div>Value & More Value</div>')
  })
})
