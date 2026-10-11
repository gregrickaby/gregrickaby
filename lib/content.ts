import 'server-only'

import data from '@/.generated/content.json'
import type { ContentIndex, Photo, Post, PostMeta } from '@/lib/types'

/*
 * Posts, pages, and photos are rendered once by `scripts/build-content.ts`.
 * Reading them is synchronous and never touches the filesystem, so every page
 * that uses them prerenders (`ensureStatic = 'navigation'`).
 */
const content = data as ContentIndex

/** All post metadata, newest first. */
export function getAllPosts(): PostMeta[] {
  return content.posts.map((post) => post.meta)
}

/** A post by slug, or null. */
export function getPost(slug: string): Post | null {
  return content.posts.find((post) => post.meta.slug === slug) ?? null
}

/** A page by slug, or null. */
export function getPage(slug: string): Post | null {
  return content.pages.find((page) => page.meta.slug === slug) ?? null
}

/** Photos for the gallery, newest first. */
export function getPhotos(): Photo[] {
  return content.photos
}

/** When the content was built, as an ISO 8601 string. */
export function getBuildTime(): string {
  return content.generatedAt
}

function sameName(a: string, b: string): boolean {
  return a.localeCompare(b, 'en', { sensitivity: 'accent' }) === 0
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

/** Posts in a category, matched without regard to case. */
export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((p) => p.categories?.some((c) => sameName(c, category)))
}

/** Posts with a tag, matched without regard to case. */
export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags?.some((t) => sameName(t, tag)))
}

/** Every category, sorted. */
export function getAllCategories(): string[] {
  return uniqueSorted(getAllPosts().flatMap((p) => p.categories ?? []))
}

/** Every tag, sorted. */
export function getAllTags(): string[] {
  return uniqueSorted(getAllPosts().flatMap((p) => p.tags ?? []))
}

/** The older and newer neighbors of a post. */
export function getAdjacentPosts(slug: string): { older: PostMeta | null; newer: PostMeta | null } {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { older: null, newer: null }
  return { older: posts[index + 1] ?? null, newer: posts[index - 1] ?? null }
}

/**
 * Posts whose title, description, categories, or tags contain every word of
 * the query, without regard to case.
 *
 * @param query - What the reader typed.
 * @returns Matching posts, newest first. Empty for a blank query.
 */
export function searchPosts(query: string): PostMeta[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return getAllPosts().filter((post) => {
    const haystack = [
      post.title,
      post.description ?? '',
      ...(post.categories ?? []),
      ...(post.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}
