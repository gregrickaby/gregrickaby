/**
 * Renders posts, pages, and photo metadata once at build time, so the server
 * never runs the Markdown pipeline, shiki, or EXIF parsing. Runs before
 * `next dev`, `next build`, and `npm run check`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildContent } from '../lib/content-build/build.ts'

const root = process.cwd()
const index = await buildContent(join(root, 'public'))
mkdirSync(join(root, '.generated'), { recursive: true })
writeFileSync(join(root, '.generated', 'content.json'), JSON.stringify(index))
console.log(
  `Built ${index.posts.length} posts, ${index.pages.length} pages, ${index.photos.length} photos`,
)
