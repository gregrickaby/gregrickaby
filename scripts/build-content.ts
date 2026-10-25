/**
 * Renders posts, pages, and photo metadata once at build time, so the server
 * never runs the Markdown pipeline, shiki, or EXIF parsing, lists each post's
 * demos, writes a Markdown copy of each post for `/<slug>.md`, and lists the
 * paths that have a page for `proxy.ts`. Runs before `next dev`, `next build`,
 * and `npm run check`.
 * `--drafts` keeps posts and pages marked `draft: true`. `npm run dev` and
 * `npm run check` pass it, so a check builds what the dev server shows;
 * `npm run build` leaves drafts out.
 *
 * Files are only written when their content changes (ignoring the build
 * time), so running a check next to `next dev` doesn't reload the page.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildContent } from '../lib/content-build/build.ts'
import { buildDemoRegistry, readDemoTitles } from '../lib/content-build/demos.ts'

const root = process.cwd()
const demosDir = join(root, 'components', 'islands', 'demos')
const { index, markdown, paths } = await buildContent(join(root, 'public'), new Date(), {
  drafts: process.argv.includes('--drafts'),
  demoTitles: readDemoTitles(demosDir),
})

function read(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined
}

/** The existing content index with this build's time, to compare everything else. */
function restamped(existing: string): string | undefined {
  try {
    return JSON.stringify({ ...JSON.parse(existing), generatedAt: index.generatedAt })
  } catch {
    return undefined
  }
}

function writeIfChanged(
  path: string,
  contents: string,
  same: (existing: string) => string | undefined = (existing) => existing,
) {
  const existing = read(path)
  if (existing !== undefined && same(existing) === contents) return
  writeFileSync(path, contents)
}

mkdirSync(join(root, '.generated'), { recursive: true })
writeIfChanged(join(root, '.generated', 'content.json'), JSON.stringify(index), restamped)
writeIfChanged(join(root, '.generated', 'markdown.json'), JSON.stringify(markdown))
writeIfChanged(join(root, '.generated', 'paths.json'), JSON.stringify(paths))
writeIfChanged(join(root, '.generated', 'demos.ts'), buildDemoRegistry(demosDir))
console.log(
  `Built ${index.posts.length} posts, ${index.pages.length} pages, ${index.photos.length} photos`,
)
