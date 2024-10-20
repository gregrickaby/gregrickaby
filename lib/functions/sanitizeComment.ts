import sanitize from 'sanitize-html'

/**
 * A utility function to sanitize HTML content.
 *
 * @param content - The HTML content to sanitize.
 * @returns The sanitized HTML content.
 */
export function sanitizeComment(content: string): string {
  return sanitize(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'], // Added <br> for line breaks
    allowedAttributes: {
      a: ['href', 'target', 'rel'] // Only allow these attributes for <a> tags
    },
    disallowedTagsMode: 'discard', // Discard disallowed tags instead of escaping them
    allowedSchemes: ['http', 'https'], // Only allow http/https schemes in <a> href
    transformTags: {
      a: (tagName, attribs) => {
        // Ensure target="_blank" and rel="noopener noreferrer" for <a> tags
        if (!attribs.rel?.includes('noopener')) {
          attribs.rel = 'noopener noreferrer'
        }
        attribs.target = '_blank' // Open links in a new tab

        return {
          tagName,
          attribs
        }
      }
    }
  })
}
