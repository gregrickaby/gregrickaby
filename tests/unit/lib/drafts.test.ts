import { describe, expect, it } from 'vitest'

import { assertNoDrafts } from '@/lib/drafts'
import { contentIndex, post } from '@/tests/helpers/content'

describe('assertNoDrafts', () => {
  it('fails a production build that holds a draft post or page', () => {
    const index = contentIndex()
    index.posts.push(post({ slug: 'wip', draft: true }))
    index.pages.push(post({ slug: 'hidden', type: 'page', draft: true }))

    expect(() => assertNoDrafts(index, true)).toThrow(
      'Draft content reached production: wip, hidden. Run `npm run content` without `--drafts` before building.',
    )
  })

  it('keeps drafts outside a production build', () => {
    const index = contentIndex()
    index.posts.push(post({ slug: 'wip', draft: true }))

    expect(() => assertNoDrafts(index, false)).not.toThrow()
  })

  it('allows a production index with no drafts', () => {
    expect(() => assertNoDrafts(contentIndex(), true)).not.toThrow()
  })
})
