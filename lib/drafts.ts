import type { ContentIndex } from '@/lib/types'

/**
 * Throws when a production build's content index still holds drafts, which
 * means `next build` ran without `npm run content` and would publish them.
 * Development and `npm run check` keep drafts on purpose.
 */
export function assertNoDrafts(index: ContentIndex, isProduction: boolean): void {
  if (!isProduction) return
  const drafts = [...index.posts, ...index.pages]
    .filter((entry) => entry.meta.draft)
    .map((entry) => entry.meta.slug)
  if (drafts.length === 0) return
  throw new Error(
    `Draft content reached production: ${drafts.join(', ')}. Run \`npm run content\` without \`--drafts\` before building.`,
  )
}
