import type {PostMeta} from './types'
import {
  buildPhotoCaption,
  decodeEntities,
  escapeHtml,
  formatPhotoDate,
  formatPostDate,
  getCaption,
  getFeaturedImagePath,
  getFirstContentImageSrc,
  normalizeMeta,
  resolveImagePaths
} from './utils'

const basePost: PostMeta = {
  title: 'Test Post',
  slug: 'test-post',
  date: '2024-06-01T00:00:00Z',
  modified: '2024-06-01T00:00:00Z',
  type: 'post'
}

describe('formatPostDate', () => {
  it('formats an ISO date string into a human-readable date', () => {
    expect(formatPostDate('2024-06-01T12:00:00Z')).toBe('June 1, 2024')
  })

  it('formats a different date correctly', () => {
    expect(formatPostDate('2000-01-15T12:00:00Z')).toBe('January 15, 2000')
  })
})

describe('getFeaturedImagePath', () => {
  it('returns null when featuredImage is not set', () => {
    expect(getFeaturedImagePath({...basePost})).toBeNull()
  })

  it('returns the correct path for a post', () => {
    const post: PostMeta = {...basePost, featuredImage: './hero.jpg'}
    expect(getFeaturedImagePath(post)).toBe('/content/posts/test-post/hero.jpg')
  })

  it('returns the correct path for a page', () => {
    const page: PostMeta = {
      ...basePost,
      type: 'page',
      slug: 'about',
      featuredImage: './cover.png'
    }
    expect(getFeaturedImagePath(page)).toBe('/content/pages/about/cover.png')
  })

  it('strips the leading ./ from the filename', () => {
    const post: PostMeta = {...basePost, featuredImage: './image.jpg'}
    expect(getFeaturedImagePath(post)).not.toContain('./')
  })
})

describe('getFirstContentImageSrc', () => {
  it('returns null when there are no images', () => {
    expect(getFirstContentImageSrc('<p>No images here</p>')).toBeNull()
  })

  it('returns the src of the first image', () => {
    const html =
      '<img src="/first.jpg" alt="first" /><img src="/second.jpg" alt="second" />'
    expect(getFirstContentImageSrc(html)).toBe('/first.jpg')
  })

  it('handles images with extra attributes', () => {
    const html =
      '<img class="hero" loading="lazy" src="/photo.jpg" alt="photo" />'
    expect(getFirstContentImageSrc(html)).toBe('/photo.jpg')
  })
})

function makeImg(alt: string, figcaption?: string): HTMLImageElement {
  const container = document.createElement('div')
  if (figcaption) {
    container.innerHTML = `<figure><img alt="${alt}" /><figcaption>${figcaption}</figcaption></figure>`
  } else {
    container.innerHTML = `<img alt="${alt}" />`
  }
  return container.querySelector('img')!
}

describe('getCaption', () => {
  it('returns the figcaption text when present', () => {
    const img = makeImg('alt text', 'Figure caption')
    expect(getCaption(img)).toBe('Figure caption')
  })

  it('falls back to the alt attribute when no figcaption is present', () => {
    const img = makeImg('my alt text')
    expect(getCaption(img)).toBe('my alt text')
  })

  it('returns an empty string when alt is empty and there is no figcaption', () => {
    const img = makeImg('')
    expect(getCaption(img)).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('escapes less-than and greater-than signs', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s')
  })

  it('returns the original string when there is nothing to escape', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})

describe('decodeEntities', () => {
  it('decodes numeric HTML entities', () => {
    expect(decodeEntities('&#72;&#101;&#108;&#108;&#111;')).toBe('Hello')
  })

  it('decodes a single entity', () => {
    expect(decodeEntities('Hello &#38; World')).toBe('Hello & World')
  })

  it('returns the original string when there are no entities', () => {
    expect(decodeEntities('No entities here')).toBe('No entities here')
  })
})

describe('normalizeMeta', () => {
  it('decodes entities in the title', () => {
    const result = normalizeMeta({
      title: 'Hello &#38; World',
      slug: 'test',
      date: '2024-01-01',
      modified: '2024-01-01',
      type: 'post'
    })
    expect(result.title).toBe('Hello & World')
  })

  it('decodes entities in the description', () => {
    const result = normalizeMeta({
      title: 'Test',
      slug: 'test',
      date: '2024-01-01',
      modified: '2024-01-01',
      type: 'post',
      description: '&#60;desc&#62;'
    })
    expect(result.description).toBe('<desc>')
  })

  it('leaves non-string title and description fields unchanged', () => {
    const result = normalizeMeta({
      slug: 'no-title',
      date: '2024-01-01',
      modified: '2024-01-01',
      type: 'post'
    })
    expect(result.title).toBeUndefined()
    expect(result.description).toBeUndefined()
  })
})

describe('resolveImagePaths', () => {
  it('rewrites relative src to absolute path for a post', () => {
    const html = '<img src="./photo.jpg" />'
    expect(resolveImagePaths(html, 'my-post', 'post')).toBe(
      '<img src="/content/posts/my-post/photo.jpg" />'
    )
  })

  it('rewrites relative src to absolute path for a page', () => {
    const html = '<img src="./photo.jpg" />'
    expect(resolveImagePaths(html, 'about', 'page')).toBe(
      '<img src="/content/pages/about/photo.jpg" />'
    )
  })

  it('rewrites multiple relative src attributes', () => {
    const html = '<img src="./a.jpg" /><img src="./b.png" />'
    expect(resolveImagePaths(html, 'my-post', 'post')).toBe(
      '<img src="/content/posts/my-post/a.jpg" /><img src="/content/posts/my-post/b.png" />'
    )
  })

  it('leaves absolute src attributes unchanged', () => {
    const html = '<img src="https://example.com/photo.jpg" />'
    expect(resolveImagePaths(html, 'my-post', 'post')).toBe(html)
  })
})

describe('formatPhotoDate', () => {
  it('formats an ISO date string with abbreviated month', () => {
    expect(formatPhotoDate('2024-06-01T12:00:00Z')).toBe('Jun 1, 2024')
  })

  it('formats a different date correctly', () => {
    expect(formatPhotoDate('2000-01-15T12:00:00Z')).toBe('Jan 15, 2000')
  })
})

describe('buildPhotoCaption', () => {
  it('returns just the title when there is no date or EXIF data', () => {
    expect(
      buildPhotoCaption({
        filename: 'test.jpg',
        title: 'Test',
        width: 800,
        height: 600
      })
    ).toBe('Test')
  })

  it('appends the formatted date to the title', () => {
    expect(
      buildPhotoCaption({
        filename: 'test.jpg',
        title: 'Test',
        width: 800,
        height: 600,
        dateTaken: '2024-06-15T12:00:00Z'
      })
    ).toBe('Test - Jun 15, 2024')
  })

  it('includes title with date and EXIF summary', () => {
    expect(
      buildPhotoCaption({
        filename: 'test.jpg',
        title: 'Test',
        width: 800,
        height: 600,
        dateTaken: '2024-06-15T12:00:00Z',
        camera: 'Sony A7 IV',
        aperture: 'f/2.8',
        iso: '400'
      })
    ).toBe('Test - Jun 15, 2024<br />Sony A7 IV · f/2.8 · ISO 400')
  })

  it('includes title without date when date is absent, with EXIF summary', () => {
    expect(
      buildPhotoCaption({
        filename: 'test.jpg',
        title: 'Golden Hour',
        width: 800,
        height: 600,
        camera: 'Canon R5',
        shutterSpeed: '1/500s'
      })
    ).toBe('Golden Hour<br />Canon R5 · 1/500s')
  })
})
