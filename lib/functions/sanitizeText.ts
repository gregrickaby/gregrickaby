import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize text with sanitize-html and remove any HTML or encoded entities.
 *
 * @param text - The text to sanitize.
 * @returns The sanitized text.
 */
export function sanitizeText(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    parser: {
      decodeEntities: true // Decode HTML entities
    }
  })
}
