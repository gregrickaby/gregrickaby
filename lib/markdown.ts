import 'server-only'

import data from '@/.generated/markdown.json'

/*
 * Each post's Markdown copy, written by `scripts/build-content.ts`. It lives
 * apart from `content.json`, so post pages don't load it.
 */
const markdown = new Map<string, string>(Object.entries(data))

/** Every slug with a Markdown copy. */
export function getMarkdownSlugs(): string[] {
  return [...markdown.keys()]
}

/** A post's Markdown copy by slug, or null. */
export function getPostMarkdown(slug: string): string | null {
  return markdown.get(slug) ?? null
}
