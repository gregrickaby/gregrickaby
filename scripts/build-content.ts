/**
 * Renders posts, pages, and photo metadata once at build time, so the server
 * never runs the Markdown pipeline, shiki, or EXIF parsing, and lists each
 * post's demos. Runs before `next dev`, `next build`, and `npm run check`.
 * `--drafts` keeps posts and pages marked `draft: true`; only `npm run dev`
 * passes it.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildContent } from '../lib/content-build/build.ts'
import { buildDemoRegistry } from '../lib/content-build/demos.ts'

const root = process.cwd()
const index = await buildContent(join(root, 'public'), new Date(), {
  drafts: process.argv.includes('--drafts'),
})
mkdirSync(join(root, '.generated'), { recursive: true })
writeFileSync(join(root, '.generated', 'content.json'), JSON.stringify(index))
writeFileSync(
  join(root, '.generated', 'demos.ts'),
  buildDemoRegistry(join(root, 'components', 'islands', 'demos')),
)
console.log(
  `Built ${index.posts.length} posts, ${index.pages.length} pages, ${index.photos.length} photos`,
)
