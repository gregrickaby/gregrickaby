import {sanitizeComment} from './sanitizeComment'

describe('sanitizeComment', () => {
  it('should remove disallowed tags', () => {
    const dirtyHtml = '<script>alert("XSS")</script><p>Hello</p>'
    const result = sanitizeComment(dirtyHtml)
    expect(result).toBe('<p>Hello</p>')
  })

  it('should allow certain tags like <b>, <i>, <strong>', () => {
    const cleanHtml =
      '<p>Hello <b>World</b> <i>italic</i> <strong>strong</strong></p>'
    const result = sanitizeComment(cleanHtml)
    expect(result).toBe(
      '<p>Hello <b>World</b> <i>italic</i> <strong>strong</strong></p>'
    )
  })

  it('should allow anchor tags with valid attributes', () => {
    const cleanHtml =
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>'
    const result = sanitizeComment(cleanHtml)
    expect(result).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>'
    )
  })

  it('should strip invalid attributes from allowed tags', () => {
    const dirtyHtml =
      '<a href="https://example.com" onclick="alert(\'XSS\')">Link</a>'
    const result = sanitizeComment(dirtyHtml)
    expect(result).toBe(
      '<a href="https://example.com" rel="noopener noreferrer" target="_blank">Link</a>'
    )
  })

  it('should add target and rel attributes to <a> tags', () => {
    const dirtyHtml = '<a href="https://example.com">Link</a>'
    const result = sanitizeComment(dirtyHtml)
    expect(result).toBe(
      '<a href="https://example.com" rel="noopener noreferrer" target="_blank">Link</a>'
    )
  })

  it('should sanitize nested elements properly', () => {
    const dirtyHtml =
      '<div><script>alert("XSS")</script><p>Hello <b>World</b></p></div>'
    const result = sanitizeComment(dirtyHtml)
    expect(result).toBe('<p>Hello <b>World</b></p>')
  })

  it('should handle empty input gracefully', () => {
    const result = sanitizeComment('')
    expect(result).toBe('')
  })
})
