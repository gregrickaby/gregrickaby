import {WP_Query} from '@/lib/api'
import {mockPost} from '@/lib/mocks'
import {beforeEach, describe, expect, it, vi} from 'vitest'

// Mock the fetch API.
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockClear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('WP_Query', () => {
  it('should initialize with default parameters', () => {
    const query = new WP_Query()
    expect(query).toBeInstanceOf(WP_Query)
    expect(query['endpoint']).toBe('https://blog.gregrickaby.com/wp-json/wp/v2')
    expect(query['postType']).toBe('posts')
    expect(query['params']).toEqual({
      after: undefined,
      author: undefined,
      author_exclude: undefined,
      before: undefined,
      categories: undefined,
      categories_exclude: undefined,
      context: 'view',
      exclude: undefined,
      fields: undefined,
      include: undefined,
      menu_order: undefined,
      modified_after: undefined,
      modified_before: undefined,
      offset: undefined,
      order: 'desc',
      orderby: 'date',
      page: 1,
      parent: undefined,
      parent_exclude: undefined,
      per_page: 10,
      search: undefined,
      search_columns: undefined,
      slug: undefined,
      status: 'publish',
      sticky: undefined,
      tags_exclude: undefined,
      tax_relation: undefined
    })
  })

  it('should initialize with custom parameters', () => {
    const query = new WP_Query({
      fields: ['id', 'title', 'slug'],
      order: 'asc',
      orderby: 'title',
      page: 2,
      post_type: 'pages',
      per_page: 5,
      search: 'search-term',
      slug: 'photos',
      status: 'draft'
    })
    expect(query['endpoint']).toBe('https://blog.gregrickaby.com/wp-json/wp/v2')
    expect(query['params']).toEqual({
      after: undefined,
      author: undefined,
      author_exclude: undefined,
      before: undefined,
      categories: undefined,
      categories_exclude: undefined,
      context: 'view',
      exclude: undefined,
      fields: ['id', 'title', 'slug'],
      include: undefined,
      menu_order: undefined,
      modified_after: undefined,
      modified_before: undefined,
      offset: undefined,
      order: 'asc',
      orderby: 'title',
      page: 2,
      parent: undefined,
      parent_exclude: undefined,
      per_page: 5,
      post_type: 'pages',
      search: 'search-term',
      search_columns: undefined,
      slug: 'photos',
      status: 'draft',
      sticky: undefined,
      tags_exclude: undefined,
      tax_relation: undefined
    })
  })

  it('should build the correct query', () => {
    const query = new WP_Query({
      fields: ['id', 'title', 'slug'],
      order: 'asc',
      orderby: 'title',
      page: 2,
      post_type: 'posts',
      per_page: 5,
      search: 'search-term',
      status: 'draft'
    })
    const theQuery = query['buildQuery']()
    expect(theQuery).toBe(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=asc&orderby=title&page=2&per_page=5&status=draft&fields=id%2Ctitle%2Cslug&search=search-term'
    )
  })

  it('should fetch posts successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost
    })

    const query = new WP_Query()
    const posts = await query.getPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=desc&orderby=date&page=1&per_page=10&status=publish',
      {next: {revalidate: 86400, tags: ['']}}
    )
    expect(posts).toEqual(mockPost)
  })

  it('should fetch a post and set the slug as tag for on-demand revalidation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost
    })

    const query = new WP_Query({
      fields: ['id', 'title', 'slug'],
      post_type: 'posts',
      slug: 'we-went-chasing-waterfalls',
      status: 'publish'
    })
    const posts = await query.getPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=desc&orderby=date&page=1&per_page=10&status=publish&fields=id%2Ctitle%2Cslug&slug=we-went-chasing-waterfalls',
      {next: {revalidate: 86400, tags: ['we-went-chasing-waterfalls']}}
    )
    expect(posts).toEqual(mockPost)
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const query = new WP_Query()
    const posts = await query.getPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=desc&orderby=date&page=1&per_page=10&status=publish',
      {next: {revalidate: 86400, tags: ['']}}
    )
    expect(posts).toEqual([])
  })

  it('should handle empty responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    const query = new WP_Query()
    const posts = await query.getPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=desc&orderby=date&page=1&per_page=10&status=publish',
      {next: {revalidate: 86400, tags: ['']}}
    )
    expect(posts).toEqual([])
  })

  it('should handle exceptions during fetch', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const query = new WP_Query()
    const posts = await query.getPosts()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://blog.gregrickaby.com/wp-json/wp/v2/posts?context=view&order=desc&orderby=date&page=1&per_page=10&status=publish',
      {next: {revalidate: 86400, tags: ['']}}
    )
    expect(posts).toEqual([])
  })
})
