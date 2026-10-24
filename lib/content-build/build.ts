import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { imageSize } from 'image-size'

import type { ContentIndex, ImageAsset, Post, PostMeta } from '../types.ts'
import { renderMarkdown, type MeasuredImage } from './markdown.ts'
import { comparePhotos, hasGainMap, readPhoto } from './photos.ts'
import { buildPostMarkdown } from './post-markdown.ts'

const NUMERIC_ENTITY = /&#(\d+);/g
const FENCED_CODE = /```[\s\S]*?```/g
const HTML_TAG = /<[^>]+>/g
const WORDS_PER_MINUTE = 230
const PHOTO_FILE = /\.(jpe?g|png|webp)$/i

/** `&#38;` becomes `&`. WordPress exports left these in titles. */
export function decodeEntities(value: string): string {
  return value.replaceAll(NUMERIC_ENTITY, (_, code: string) =>
    String.fromCodePoint(Number.parseInt(code, 10)),
  )
}

/**
 * Minutes to read a Markdown body, counting prose and skipping code blocks and
 * HTML tags. Never less than one.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown.replaceAll(FENCED_CODE, ' ').replaceAll(HTML_TAG, ' ').split(/\s+/)
  return Math.max(1, Math.round(words.filter(Boolean).length / WORDS_PER_MINUTE))
}

function folders(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isDirectory())
    .sort()
}

function strings(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map(String) : undefined
}

/** Output of {@link buildContent}. */
export interface BuiltContent {
  /** The content index the app reads at runtime. */
  index: ContentIndex
  /** Each post's Markdown copy, keyed by slug. */
  markdown: Record<string, string>
}

/**
 * Reads and renders every post, page, and photo under `publicDir/content`.
 * Pure apart from reading files, so tests can point it at a fixture folder.
 *
 * @param publicDir - The app's `public/` folder.
 * @param now - The build time to record.
 * @param options - `drafts` keeps entries marked `draft: true`, for previews
 *   in development. Builds leave them out, so they never publish.
 *   `demoTitles` names each post's demos in its Markdown copy, keyed by slug.
 * @returns The content index and each post's Markdown copy.
 */
export async function buildContent(
  publicDir: string,
  now = new Date(),
  {
    drafts = false,
    demoTitles = {},
  }: { drafts?: boolean; demoTitles?: Record<string, Record<string, string>> } = {},
): Promise<BuiltContent> {
  const markdown: Record<string, string> = {}
  const sizes = new Map<string, MeasuredImage | null>()

  function measure(publicPath: string): MeasuredImage | null {
    if (sizes.has(publicPath)) return sizes.get(publicPath) ?? null
    let result: MeasuredImage | null = null
    try {
      const buffer = readFileSync(join(publicDir, decodeURIComponent(publicPath)))
      const { width = 0, height = 0 } = imageSize(buffer)
      result = { width, height, hdr: hasGainMap(buffer) }
    } catch {
      result = null
    }
    sizes.set(publicPath, result)
    return result
  }

  function asset(publicPath: string): ImageAsset | undefined {
    const size = measure(publicPath)
    return size ? { src: publicPath, width: size.width, height: size.height } : undefined
  }

  async function readEntries(type: PostMeta['type']): Promise<Post[]> {
    const dir = join(publicDir, 'content', type === 'post' ? 'posts' : 'pages')
    const entries: Post[] = []
    for (const slug of folders(dir)) {
      const file = join(dir, slug, 'content.mdx')
      if (!existsSync(file)) continue
      const { data, content } = matter(readFileSync(file, 'utf-8'))
      const draft = data.draft === true
      if (draft && !drafts) continue
      const basePath = `/content/${type === 'post' ? 'posts' : 'pages'}/${slug}`
      const { html, images, headings } = await renderMarkdown(content, { basePath, measure })

      const featured =
        typeof data.featuredImage === 'string'
          ? asset(`${basePath}/${data.featuredImage.replace(/^\.\//, '')}`)
          : undefined
      const meta: PostMeta = {
        title: decodeEntities(String(data.title ?? slug)),
        slug: String(data.slug ?? slug),
        date: String(data.date ?? ''),
        modified: String(data.modified ?? data.date ?? ''),
        type,
        description:
          typeof data.description === 'string' ? decodeEntities(data.description) : undefined,
        featuredImage: featured,
        categories: strings(data.categories),
        tags: strings(data.tags),
        readingMinutes: readingMinutes(content),
        ...(draft ? { draft } : {}),
      }
      const hero = featured && images[0] !== featured.src ? featured : null
      if (type === 'post') {
        markdown[meta.slug] = buildPostMarkdown(content, {
          meta,
          basePath,
          demoTitles: demoTitles[meta.slug],
        })
      }
      entries.push({ meta, html, headings, hero })
    }
    return entries
  }

  const posts = (await readEntries('post')).sort((a, b) => b.meta.date.localeCompare(a.meta.date))
  const pages = await readEntries('page')

  const photosDir = join(publicDir, 'content', 'photos')
  const photoFiles = existsSync(photosDir)
    ? readdirSync(photosDir).filter((f) => PHOTO_FILE.test(f))
    : []
  const photos = (
    await Promise.all(photoFiles.map((f) => readPhoto(readFileSync(join(photosDir, f)), f)))
  ).sort(comparePhotos)

  return { index: { generatedAt: now.toISOString(), posts, pages, photos }, markdown }
}
