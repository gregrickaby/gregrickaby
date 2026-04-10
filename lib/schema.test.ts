import {
  buildBlogPostingGraph,
  buildWebPageGraph,
  buildWebSiteGraph,
  serializeSchema
} from './schema'

describe('buildWebSiteGraph', () => {
  it('includes a WebSite node with the site url', () => {
    const graph = buildWebSiteGraph()
    const node = graph['@graph'].find((n) => n['@type'] === 'WebSite')
    expect(node).toBeDefined()
    expect(node?.url).toBe('https://gregrickaby.com')
    expect(node?.name).toBe('Greg Rickaby')
  })

  it('includes a Person node with author details', () => {
    const graph = buildWebSiteGraph()
    const node = graph['@graph'].find(
      (n) => Array.isArray(n['@type']) && n['@type'].includes('Person')
    )
    expect(node).toBeDefined()
    expect(node?.name).toBe('Greg Rickaby')
  })

  it('sets @context to https://schema.org', () => {
    const graph = buildWebSiteGraph()
    expect(graph['@context']).toBe('https://schema.org')
  })
})

describe('buildBlogPostingGraph', () => {
  const meta = {
    title: 'Test Post',
    slug: 'test-post',
    date: '2024-01-01T00:00:00Z',
    modified: '2024-01-02T00:00:00Z',
    type: 'post' as const,
    description: 'A test post description',
    featuredImage: './hero.jpg'
  }

  it('includes a BlogPosting node with headline and dates', () => {
    const graph = buildBlogPostingGraph(meta)
    const node = graph['@graph'].find((n) => n['@type'] === 'BlogPosting')
    expect(node).toBeDefined()
    expect(node?.headline).toBe('Test Post')
    expect(node?.datePublished).toBe('2024-01-01T00:00:00Z')
    expect(node?.dateModified).toBe('2024-01-02T00:00:00Z')
  })

  it('includes the featured image in the BlogPosting node', () => {
    const graph = buildBlogPostingGraph(meta)
    const node = graph['@graph'].find((n) => n['@type'] === 'BlogPosting') as {
      image?: {url: string}
    }
    expect(node?.image?.url).toContain('hero.jpg')
  })

  it('omits image when featuredImage is absent', () => {
    const {featuredImage: _, ...metaWithoutImage} = meta
    const graph = buildBlogPostingGraph(metaWithoutImage)
    const node = graph['@graph'].find((n) => n['@type'] === 'BlogPosting') as {
      image?: unknown
    }
    expect(node?.image).toBeUndefined()
  })

  it('includes a BreadcrumbList with two items', () => {
    const graph = buildBlogPostingGraph(meta)
    const node = graph['@graph'].find(
      (n) => n['@type'] === 'BreadcrumbList'
    ) as unknown as {
      itemListElement: unknown[]
    }
    expect(node).toBeDefined()
    expect(node?.itemListElement).toHaveLength(2)
  })

  it('includes a WebPage node', () => {
    const graph = buildBlogPostingGraph(meta)
    const node = graph['@graph'].find((n) => n['@type'] === 'WebPage')
    expect(node).toBeDefined()
    expect(node?.url).toContain('test-post')
  })
})

describe('buildWebPageGraph', () => {
  const args = {
    title: 'About',
    description: 'About page content',
    path: 'about'
  }

  it('includes a WebPage node with the correct url', () => {
    const graph = buildWebPageGraph(args)
    const node = graph['@graph'].find((n) => n['@type'] === 'WebPage')
    expect(node).toBeDefined()
    expect(node?.name).toBe('About')
    expect(node?.url).toBe('https://gregrickaby.com/about')
  })

  it('includes a BreadcrumbList with two items', () => {
    const graph = buildWebPageGraph(args)
    const node = graph['@graph'].find(
      (n) => n['@type'] === 'BreadcrumbList'
    ) as unknown as {itemListElement: unknown[]}
    expect(node?.itemListElement).toHaveLength(2)
  })
})

describe('serializeSchema', () => {
  it('returns a valid JSON string', () => {
    const graph = buildWebSiteGraph()
    const serialized = serializeSchema(graph)
    expect(() => JSON.parse(serialized)).not.toThrow()
  })

  it(String.raw`replaces < with \u003c to prevent XSS`, () => {
    const graph = buildWebSiteGraph()
    ;(graph['@graph'][0] as Record<string, unknown>).name =
      '<script>alert(1)</script>'
    const serialized = serializeSchema(graph)
    expect(serialized).not.toContain('<script>')
    expect(serialized).toContain(String.raw`\u003cscript`)
  })

  it(String.raw`replaces > with \u003e`, () => {
    const graph = buildWebSiteGraph()
    ;(graph['@graph'][0] as Record<string, unknown>).name = 'a > b'
    const serialized = serializeSchema(graph)
    expect(serialized).not.toContain('>')
    expect(serialized).toContain(String.raw`\u003e`)
  })

  it(String.raw`replaces & with \u0026`, () => {
    const graph = buildWebSiteGraph()
    ;(graph['@graph'][0] as Record<string, unknown>).name = 'A & B'
    const serialized = serializeSchema(graph)
    expect(serialized).not.toContain('&')
    expect(serialized).toContain(String.raw`\u0026`)
  })
})
