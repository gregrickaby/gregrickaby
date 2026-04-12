vi.mock('react', () => ({cache: (fn: unknown) => fn}))

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn()
  }
}))

vi.mock('gray-matter', () => ({
  default: vi.fn()
}))

import matter from 'gray-matter'
import fs, {type Stats} from 'node:fs'
import {
  getAllCategories,
  getAllPosts,
  getAllTags,
  getPageBySlug,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag
} from './content'

const mockExistsSync = vi.mocked(fs.existsSync)
const mockReadFileSync = vi.mocked(fs.readFileSync)
const mockReaddirSync = vi.mocked(fs.readdirSync)
const mockStatSync = vi.mocked(fs.statSync)
const mockMatter = vi.mocked(matter)

const baseMeta = {
  title: 'Test Post',
  slug: 'test-post',
  date: '2024-06-01T00:00:00Z',
  modified: '2024-06-01T00:00:00Z',
  type: 'post' as const
}

function mockSinglePost(
  meta: typeof baseMeta & {tags?: string[]; categories?: string[]},
  markdownContent = '# Hello'
): void {
  mockExistsSync.mockReturnValue(true)
  mockReaddirSync.mockReturnValue([meta.slug] as unknown as ReturnType<
    typeof fs.readdirSync
  >)
  mockStatSync.mockReturnValue({isDirectory: () => true} as unknown as Stats)
  mockReadFileSync.mockReturnValue(
    markdownContent as unknown as ReturnType<typeof fs.readFileSync>
  )
  mockMatter.mockReturnValue({
    data: meta,
    content: markdownContent
  } as unknown as ReturnType<typeof matter>)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('getAllPosts', () => {
  it('returns an empty array when the posts directory does not exist', () => {
    mockExistsSync.mockReturnValue(false)
    expect(getAllPosts()).toEqual([])
  })

  it('returns posts sorted by date descending', () => {
    const old = {...baseMeta, slug: 'old', date: '2023-01-01T00:00:00Z'}
    const recent = {...baseMeta, slug: 'recent', date: '2024-06-01T00:00:00Z'}
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue(['old', 'recent'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockStatSync.mockReturnValue({isDirectory: () => true} as unknown as Stats)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter
      .mockReturnValueOnce({
        data: old,
        content: ''
      } as unknown as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: recent,
        content: ''
      } as unknown as ReturnType<typeof matter>)

    const result = getAllPosts()
    expect(result[0].slug).toBe('recent')
    expect(result[1].slug).toBe('old')
  })

  it('skips entries that are not directories', () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      '.DS_Store',
      'test-post'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockStatSync.mockImplementation(
      (p) =>
        ({
          isDirectory: () => !String(p).endsWith('.DS_Store')
        }) as unknown as Stats
    )
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: ''
    } as unknown as ReturnType<typeof matter>)

    expect(getAllPosts()).toHaveLength(1)
  })

  it('skips slugs without a content.md file', () => {
    mockExistsSync
      .mockReturnValueOnce(true) // postsDir exists
      .mockReturnValueOnce(false) // content.md does not exist
    mockReaddirSync.mockReturnValue(['no-content'] as unknown as ReturnType<
      typeof fs.readdirSync
    >)
    mockStatSync.mockReturnValue({isDirectory: () => true} as unknown as Stats)

    expect(getAllPosts()).toEqual([])
  })

  it('decodes HTML entities in post titles', () => {
    mockSinglePost({...baseMeta, title: 'Hello &#38; World'})
    expect(getAllPosts()[0].title).toBe('Hello & World')
  })
})

describe('getPostBySlug', () => {
  it('returns null when the content file does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    expect(await getPostBySlug('missing')).toBeNull()
  })

  it('returns the parsed post when the file exists', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '# Hello'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result).not.toBeNull()
    expect(result?.meta.title).toBe('Test Post')
    expect(result?.content).toContain('<h1>Hello</h1>')
  })

  it('resolves relative image paths within post content', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '![alt](./photo.jpg)'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toContain('/content/posts/test-post/photo.jpg')
  })

  it('transforms an image with a title into a figure with caption', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '![alt text](./img.jpg "My Caption")'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toContain('<figure>')
    expect(result?.content).toContain('<figcaption>My Caption</figcaption>')
  })

  it('escapes HTML special characters in figure captions', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '![alt](./img.jpg "A <b> & caption")'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toContain('&lt;b&gt; &amp; caption')
  })

  it('escapes double quotes in image alt text within figures', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '!["quoted alt"](./img.jpg "Caption")'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toContain('&quot;quoted alt&quot;')
  })

  it('handles a figure image with no alt text (null alt branch)', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '![](./img.jpg "Caption")'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toContain('<figure>')
    expect(result?.content).toContain('alt=""')
    expect(result?.content).toContain('<figcaption>Caption</figcaption>')
  })

  it('preserves the shiki background-color style attribute on pre elements', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: baseMeta,
      content: '```js\nconsole.log("hi")\n```'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPostBySlug('test-post')
    expect(result?.content).toMatch(/<pre[^>]+style="[^"]*background-color/)
  })
})

describe('getPageBySlug', () => {
  it('returns null when the page file does not exist', async () => {
    mockExistsSync.mockReturnValue(false)
    expect(await getPageBySlug('missing')).toBeNull()
  })

  it('returns the parsed page with the correct base path for images', async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter.mockReturnValue({
      data: {...baseMeta, type: 'page' as const},
      content: '![alt](./photo.jpg)'
    } as unknown as ReturnType<typeof matter>)

    const result = await getPageBySlug('about')
    expect(result?.content).toContain('/content/pages/about/photo.jpg')
  })
})

describe('getPostsByTag', () => {
  it('returns posts matching the tag (case-insensitive)', () => {
    mockSinglePost({...baseMeta, tags: ['JavaScript', 'TypeScript']})
    expect(getPostsByTag('javascript')).toHaveLength(1)
  })

  it('returns an empty array when no posts match the tag', () => {
    mockSinglePost({...baseMeta, tags: ['React']})
    expect(getPostsByTag('vue')).toHaveLength(0)
  })

  it('returns an empty array when posts have no tags', () => {
    mockSinglePost(baseMeta)
    expect(getPostsByTag('anything')).toHaveLength(0)
  })
})

describe('getPostsByCategory', () => {
  it('returns posts matching the category (case-insensitive)', () => {
    mockSinglePost({...baseMeta, categories: ['Next.js']})
    expect(getPostsByCategory('next.js')).toHaveLength(1)
  })

  it('returns an empty array when no posts match the category', () => {
    mockSinglePost({...baseMeta, categories: ['React']})
    expect(getPostsByCategory('Vue')).toHaveLength(0)
  })

  it('returns an empty array when posts have no categories', () => {
    mockSinglePost(baseMeta)
    expect(getPostsByCategory('anything')).toHaveLength(0)
  })
})

describe('getAllTags', () => {
  it('returns all unique tags sorted alphabetically', () => {
    mockSinglePost({...baseMeta, tags: ['zebra', 'apple', 'mango']})
    expect(getAllTags()).toEqual(['apple', 'mango', 'zebra'])
  })

  it('deduplicates tags across posts', () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'post-1',
      'post-2'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockStatSync.mockReturnValue({isDirectory: () => true} as unknown as Stats)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter
      .mockReturnValueOnce({
        data: {...baseMeta, slug: 'post-1', tags: ['react', 'css']},
        content: ''
      } as unknown as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: {...baseMeta, slug: 'post-2', tags: ['react', 'typescript']},
        content: ''
      } as unknown as ReturnType<typeof matter>)

    expect(getAllTags()).toEqual(['css', 'react', 'typescript'])
  })

  it('returns an empty array when no posts have tags', () => {
    mockSinglePost(baseMeta)
    expect(getAllTags()).toEqual([])
  })
})

describe('getAllCategories', () => {
  it('returns all unique categories sorted alphabetically', () => {
    mockSinglePost({...baseMeta, categories: ['React', 'CSS', 'JavaScript']})
    expect(getAllCategories()).toEqual(['CSS', 'JavaScript', 'React'])
  })

  it('deduplicates categories across posts', () => {
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([
      'post-1',
      'post-2'
    ] as unknown as ReturnType<typeof fs.readdirSync>)
    mockStatSync.mockReturnValue({isDirectory: () => true} as unknown as Stats)
    mockReadFileSync.mockReturnValue(
      '' as unknown as ReturnType<typeof fs.readFileSync>
    )
    mockMatter
      .mockReturnValueOnce({
        data: {...baseMeta, slug: 'post-1', categories: ['Next.js', 'React']},
        content: ''
      } as unknown as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: {...baseMeta, slug: 'post-2', categories: ['React', 'CSS']},
        content: ''
      } as unknown as ReturnType<typeof matter>)

    expect(getAllCategories()).toEqual(['CSS', 'Next.js', 'React'])
  })

  it('returns an empty array when no posts have categories', () => {
    mockSinglePost(baseMeta)
    expect(getAllCategories()).toEqual([])
  })
})
