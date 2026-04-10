import matter from 'gray-matter'
import type {Paragraph, Root} from 'mdast'
import fs from 'node:fs'
import path from 'node:path'
import {cache} from 'react'
import {remark} from 'remark'
import gfm from 'remark-gfm'
import html from 'remark-html'
import sanitizeHtml from 'sanitize-html'
import {visit} from 'unist-util-visit'
import type {Post, PostMeta} from './types'
import {normalizeMeta, resolveImagePaths} from './utils'

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
    '*': ['class', 'id']
  }
}

async function getContentBySlug(
  slug: string,
  type: 'post' | 'page'
): Promise<Post | null> {
  const dir = type === 'post' ? 'posts' : 'pages'
  const filePath = path.join(contentDir, dir, slug, 'content.md')
  if (!fs.existsSync(filePath)) return null

  const fileContents = fs.readFileSync(filePath, 'utf-8')
  const {data, content} = matter(fileContents)

  const processed = await remark()
    .use(gfm)
    .use(remarkFigureCaption)
    .use(html, {sanitize: false})
    .process(content)
  let htmlContent = processed.toString()
  htmlContent = resolveImagePaths(htmlContent, slug, type)
  htmlContent = sanitizeHtml(htmlContent, sanitizeOptions)

  return {
    meta: normalizeMeta(data),
    content: htmlContent
  }
}

/** Fetches a post by its slug, returning null when not found. Results are memoized per request. */
export const getPostBySlug = cache(
  async (slug: string): Promise<Post | null> => getContentBySlug(slug, 'post')
)

/** Fetches a page by its slug, returning null when not found. Results are memoized per request. */
export const getPageBySlug = cache(
  async (slug: string): Promise<Post | null> => getContentBySlug(slug, 'page')
)

/** Returns all post metadata sorted by date descending. Results are memoized per request. */
export const getAllPosts = cache((): PostMeta[] => {
  const postsDir = path.join(contentDir, 'posts')
  if (!fs.existsSync(postsDir)) return []

  const slugs = fs.readdirSync(postsDir).filter((name) => {
    return fs.statSync(path.join(postsDir, name)).isDirectory()
  })

  const posts: PostMeta[] = slugs
    .map((slug) => {
      const filePath = path.join(postsDir, slug, 'content.md')
      if (!fs.existsSync(filePath)) return null
      const fileContents = fs.readFileSync(filePath, 'utf-8')
      const {data} = matter(fileContents)
      return normalizeMeta(data)
    })
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
})

/** Returns posts matching a given tag (case-insensitive). */
export function getPostsByTag(tag: string): PostMeta[] {
  const lower = tag.toLowerCase()
  return getAllPosts().filter((p) =>
    p.tags?.some((t) => t.toLowerCase() === lower)
  )
}

/** Returns posts matching a given category (case-insensitive). */
export function getPostsByCategory(category: string): PostMeta[] {
  const lower = category.toLowerCase()
  return getAllPosts().filter((p) =>
    p.categories?.some((c) => c.toLowerCase() === lower)
  )
}

/** Returns all unique tags across all posts, sorted alphabetically. */
export function getAllTags(): string[] {
  const tags = new Set<string>()
  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) {
      tags.add(tag)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

/** Returns all unique categories across all posts, sorted alphabetically. */
export function getAllCategories(): string[] {
  const categories = new Set<string>()
  for (const post of getAllPosts()) {
    for (const cat of post.categories ?? []) {
      categories.add(cat)
    }
  }
  return [...categories].sort((a, b) => a.localeCompare(b))
}
