import { SITE } from '../site.ts'
import type { PostMeta } from '../types.ts'

/** Inputs for {@link buildPostMarkdown}. */
export interface PostMarkdownOptions {
  meta: Pick<PostMeta, 'title' | 'slug' | 'date' | 'description'>
  /** URL path of the post's folder under `public/`, such as `/content/posts/my-post`. */
  basePath: string
  /** Titles of the post's demos, keyed by name. */
  demoTitles?: Record<string, string>
}

const FENCE = /^\s*(`{3,}|~{3,})/
const DEMO_MARKER = /^<div data-demo="([^"]+)"><\/div>$/
const LIKE_CUE = /\s*<span data-like-cue><\/span>/g
const RELATIVE_IMAGE = /(!\[[^\]]*\]\()\.\/([^)\s]+)/g
const RELATIVE_ATTR = /\b(src|href)="\.\/([^"]+)"/g

/**
 * Turns a post's Markdown source into a copy for readers and agents: a title
 * and the post's URL, date, and description on top, then the body with
 * relative media pointed at the live site, demo markers swapped for a line
 * that links to the post, and like cues removed. Code fences stay as written.
 *
 * @param body - The post's Markdown, without frontmatter.
 * @param options - The post's metadata, folder, and demo titles.
 * @returns The Markdown to serve at `/<slug>.md`.
 */
export function buildPostMarkdown(
  body: string,
  { meta, basePath, demoTitles = {} }: PostMarkdownOptions,
): string {
  const url = `${SITE.url}/${meta.slug}`
  const media = `${SITE.url}${basePath}`
  let fence: string | null = null

  const lines = body.split('\n').map((line) => {
    const opener = FENCE.exec(line)?.[1]
    if (fence) {
      if (opener && opener[0] === fence[0] && opener.length >= fence.length) fence = null
      return line
    }
    if (opener) {
      fence = opener
      return line
    }
    const demo = DEMO_MARKER.exec(line.trim())?.[1]
    if (demo) return `_Interactive demo: ${demoTitles[demo] ?? demo}. Try it at <${url}>._`
    return line
      .replaceAll(LIKE_CUE, '')
      .replaceAll(RELATIVE_IMAGE, `$1${media}/$2`)
      .replaceAll(RELATIVE_ATTR, `$1="${media}/$2"`)
  })

  const header = [
    `# ${meta.title}`,
    '',
    `- URL: <${url}>`,
    ...(meta.date ? [`- Published: ${meta.date.slice(0, 10)}`] : []),
    ...(meta.description ? ['', meta.description] : []),
  ]
  return `${[...header, '', lines.join('\n').trim()].join('\n')}\n`
}
