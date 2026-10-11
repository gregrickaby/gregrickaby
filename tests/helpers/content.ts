import type { ContentIndex, Photo, Post, PostMeta } from '@/lib/types'

/** A post's metadata with test defaults. */
export function postMeta(overrides: Partial<PostMeta> = {}): PostMeta {
  const slug = overrides.slug ?? 'first-post'
  return {
    title: 'First Post',
    slug,
    date: '2024-01-11T16:13:21',
    modified: '2024-02-01T10:00:00',
    type: 'post',
    description: 'A post about the moon.',
    featuredImage: { src: `/content/posts/${slug}/hero.jpg`, width: 1600, height: 900 },
    categories: ['Blog'],
    tags: ['Moon', 'Astrophotography'],
    readingMinutes: 5,
    ...overrides,
  }
}

/** A post with HTML and a hero. */
export function post(overrides: Partial<PostMeta> = {}, html = '<p>Hello moon</p>'): Post {
  const meta = postMeta(overrides)
  return { meta, html, hero: meta.featuredImage ?? null }
}

/** A gallery photo with test defaults. */
export function photo(overrides: Partial<Photo> = {}): Photo {
  const filename = overrides.filename ?? 'Moon_20240101.jpg'
  return {
    filename,
    src: `/content/photos/${filename}`,
    width: 3000,
    height: 2000,
    hdr: false,
    title: 'Moon',
    camera: 'SONY ILCE-7RM5',
    aperture: 'f/6.3',
    iso: '100',
    ...overrides,
  }
}

/** Three posts (newest first), the about/resume/contact pages, and two photos. */
export function contentIndex(): ContentIndex {
  return {
    generatedAt: '2026-10-11T20:00:00.000Z',
    posts: [
      post({ slug: 'newest', title: 'Newest Post', date: '2025-01-01T00:00:00', tags: ['Moon'] }),
      post(
        {
          slug: 'middle',
          title: 'Middle Post',
          date: '2024-01-01T00:00:00',
          categories: ['Code'],
          tags: ['PHP'],
          description: 'WordPress snippets',
        },
        '<p>Code</p>',
      ),
      post({
        slug: 'oldest',
        title: 'Oldest Post',
        date: '2013-01-01T00:00:00',
        featuredImage: undefined,
        description: undefined,
        categories: undefined,
        tags: undefined,
      }),
    ],
    pages: [
      post({ slug: 'about', title: 'About', type: 'page' }, '<p>Hello there</p>'),
      post({ slug: 'resume', title: 'Resume', type: 'page', featuredImage: undefined }),
      post({
        slug: 'contact',
        title: 'Contact',
        type: 'page',
        featuredImage: undefined,
        description: undefined,
      }),
    ],
    photos: [
      photo(),
      photo({ filename: 'Castle.jpg', title: 'Castle', hdr: true, caption: 'At dusk' }),
    ],
  }
}
