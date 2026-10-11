/** A slice of post HTML that starts at an `<h2>`, or the part before the first one. */
export interface HtmlSection {
  /** The heading's id, or null for the part before the first heading. */
  id: string | null
  /** The heading's text, or null for the part before the first heading. */
  title: string | null
  /** The section's HTML, without its heading. */
  html: string
}

const H2 = /<h2 id="([^"]*)">([\s\S]*?)<\/h2>/g

/**
 * Splits rendered HTML at each `<h2>`, so a page can lay its sections out
 * separately. The HTML was sanitized at build, so slicing it at tag
 * boundaries keeps it safe.
 *
 * @param html - Output of the build's Markdown renderer.
 * @returns The lead section (which may be empty), then one section per heading.
 */
export function splitSections(html: string): [HtmlSection, ...HtmlSection[]] {
  const sections: HtmlSection[] = []
  let current: HtmlSection = { id: null, title: null, html: '' }
  let last = 0
  for (const match of html.matchAll(H2)) {
    current.html = html.slice(last, match.index).trim()
    sections.push(current)
    current = { id: String(match[1]), title: String(match[2]), html: '' }
    last = match.index + match[0].length
  }
  current.html = html.slice(last).trim()
  sections.push(current)
  return sections as [HtmlSection, ...HtmlSection[]]
}
