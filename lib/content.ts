import matter from 'gray-matter'
import type {Paragraph, Root} from 'mdast'
import fs from 'node:fs'
import path from 'node:path'
import {cacheLife, cacheTag} from 'next/cache'
import {cache} from 'react'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import gfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import sanitizeHtml from 'sanitize-html'
import {unified} from 'unified'
import {visit} from 'unist-util-visit'
import type {Post, PostMeta} from './types'
import {normalizeMeta, resolveImagePaths} from './utils'

/**
 * Remark plugin that converts a lone image with a title attribute into a
 * `<figure>/<figcaption>` pair. Only applies when the image is the sole child
 * of its paragraph and the image has a title.
 *
 * @returns A unified transformer function.
 */
function remarkFigureCaption() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (
        node.children.length === 1 &&
        node.children[0].type === 'image' &&
        node.children[0].title &&
        parent &&
        index !== undefined
      ) {
        const img = node.children[0]
        /* v8 ignore next -- MDast types alt as string|null but remark always provides a string */
        const alt = (img.alt ?? '').replaceAll('"', '&quot;')
        const title = img
          .title!.replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
        parent.children.splice(index, 1, {
          type: 'html',
          value: `<figure>\n<img src="${img.url}" alt="${alt}" />\n<figcaption>${title}</figcaption>\n</figure>`
        })
      }
    })
  }
}

export type {Post, PostMeta} from './types'

const contentDir = path.join(process.cwd(), 'public', 'content')

/**
 * sanitize-html options that extend the defaults to allow the extra tags and
 * attributes used by this site's Markdown pipeline (images, figures, tables,
 * audio, and shiki code-block markup).
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'figure',
    'figcaption',
    'details',
    'summary',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'audio',
    'source'
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    audio: ['controls', 'src', 'preload'],
    source: ['src', 'type'],
    pre: ['tabindex', 'data-language', 'data-theme', 'style'],
    code: ['data-language', 'data-theme'],
    span: ['data-line', 'data-highlight', 'style'],
    figure: ['data-rehype-pretty-code-figure'],
    '*': ['class', 'id']
  }
}

/**
 * Reads, processes, and sanitizes the MDX content file for a given slug.
 * Runs the full remark/rehype pipeline (GFM, figure captions, shiki syntax
 * highlighting) and strips unsafe HTML before returning.
 *
 * @param slug - The URL-safe slug identifying the content directory.
 * @param type - Whether to look in `posts/` or `pages/`.
 * @returns The parsed post with metadata and sanitized HTML, or null if not found.
 */
async function getContentBySlug(
  slug: string,
  type: 'post' | 'page'
): Promise<Post | null> {
  const dir = type === 'post' ? 'posts' : 'pages'
  const filePath = path.join(contentDir, dir, slug, 'content.mdx')
  if (!fs.existsSync(filePath)) return null

  const fileContents = fs.readFileSync(filePath, 'utf-8')
  const {data, content} = matter(fileContents)

  const processed = await unified()
    .use(remarkParse)
    .use(gfm)
    .use(remarkFigureCaption)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(rehypePrettyCode, {
      theme: 'github-dark',
      keepBackground: true
    })
    .use(rehypeStringify)
    .process(content)
  let htmlContent = processed.toString()
  htmlContent = resolveImagePaths(htmlContent, slug, type)
  htmlContent = sanitizeHtml(htmlContent, sanitizeOptions)

  return {
    meta: normalizeMeta(data),
    content: htmlContent
  }
}

/**
 * Fetches a post by its slug, returning null when not found.
 * Results are deduplicated within a render pass via React cache() and
 * persisted across requests via Next.js 'use cache'.
 *
 * @param slug - The URL-safe slug of the post to fetch.
 * @returns The post data including metadata and rendered content, or null if not found.
 */
export const getPostBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    'use cache'
    cacheLife('max')
    cacheTag('posts', `post-${slug}`)
    return getContentBySlug(slug, 'post')
  }
)

/**
 * Fetches a page by its slug, returning null when not found.
 * Results are deduplicated within a render pass via React cache() and
 * persisted across requests via Next.js 'use cache'.
 *
 * @param slug - The URL-safe slug of the page to fetch.
 * @returns The page data including metadata and rendered content, or null if not found.
 */
export const getPageBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    'use cache'
    cacheLife('max')
    cacheTag('pages', `page-${slug}`)
    return getContentBySlug(slug, 'page')
  }
)

/**
 * Returns all post metadata sorted by date descending.
 * Results are deduplicated within a render pass via React cache() and
 * persisted across requests via Next.js 'use cache'.
 *
 * @returns An array of post metadata objects sorted newest first.
 */
export const getAllPosts = cache(async (): Promise<PostMeta[]> => {
  'use cache'
  cacheLife('max')
  cacheTag('posts')

  const postsDir = path.join(contentDir, 'posts')
  if (!fs.existsSync(postsDir)) return []

  const slugs = fs.readdirSync(postsDir).filter((name) => {
    return fs.statSync(path.join(postsDir, name)).isDirectory()
  })

  const posts: PostMeta[] = slugs
    .map((slug) => {
      const filePath = path.join(postsDir, slug, 'content.mdx')
      if (!fs.existsSync(filePath)) return null
      const fileContents = fs.readFileSync(filePath, 'utf-8')
      const {data} = matter(fileContents)
      return normalizeMeta(data)
    })
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
})

/**
 * Returns posts matching a given tag (case-insensitive).
 *
 * @param tag - The tag to filter posts by.
 * @returns An array of post metadata matching the tag.
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const lower = tag.toLowerCase()
  return (await getAllPosts()).filter((p) =>
    p.tags?.some((t) => t.toLowerCase() === lower)
  )
}

/**
 * Returns posts matching a given category (case-insensitive).
 *
 * @param category - The category to filter posts by.
 * @returns An array of post metadata matching the category.
 */
export async function getPostsByCategory(
  category: string
): Promise<PostMeta[]> {
  const lower = category.toLowerCase()
  return (await getAllPosts()).filter((p) =>
    p.categories?.some((c) => c.toLowerCase() === lower)
  )
}

/**
 * Returns all unique tags across all posts, sorted alphabetically.
 *
 * @returns An array of unique tag strings.
 */
export async function getAllTags(): Promise<string[]> {
  const tags = new Set<string>()
  for (const post of await getAllPosts()) {
    for (const tag of post.tags ?? []) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

/**
 * Returns all unique categories across all posts, sorted alphabetically.
 *
 * @returns An array of unique category strings.
 */
export async function getAllCategories(): Promise<string[]> {
  const categories = new Set<string>()
  for (const post of await getAllPosts()) {
    for (const cat of post.categories ?? []) {
      categories.add(cat)
    }
  }
  return [...categories].sort((a, b) => a.localeCompare(b))
}
