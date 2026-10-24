import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Blockquote, Root as MdastRoot, Paragraph, PhrasingContent } from 'mdast'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import sanitizeHtml from 'sanitize-html'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { fullImageUrl, IMAGE_WIDTHS, optimizedImageUrl } from '../images.ts'
import type { Heading } from '../types.ts'
import { readableColor } from './contrast.ts'

/** What the build knows about a local image file. */
export interface MeasuredImage {
  width: number
  height: number
  /** True when the JPEG carries an HDR gain map. */
  hdr: boolean
}

/** Reads a local image's size, or returns null when the file is missing or unreadable. */
export type MeasureImage = (publicPath: string) => MeasuredImage | null

/** Inputs for {@link renderMarkdown}. */
export interface RenderOptions {
  /** URL path of the content's folder under `public/`, such as `/content/posts/my-post`. */
  basePath: string
  measure: MeasureImage
}

const SIZES_DEFAULT = '(max-width: 720px) 100vw, 680px'
const SIZES_WIDE = '(max-width: 1100px) 100vw, 1100px'
const SIZES_FULL = '100vw'

const MEDIA_TAGS = new Set(['img', 'source', 'audio', 'video'])

/**
 * Turns a lone image with a title (`![alt](src "title")`) into a figure with a caption.
 */
function remarkFigureCaption() {
  return (tree: MdastRoot) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      const img = node.children[0]
      const isLone = node.children.length === 1 && img?.type === 'image'
      if (!isLone || !img.title || !parent || index === undefined) return
      parent.children.splice(index, 1, {
        type: 'html',
        // remark always sets alt to a string; mdast types allow null.
        /* v8 ignore next */
        value: `<figure>\n<img src="${escapeAttr(img.url)}" alt="${escapeAttr(img.alt ?? '')}" />\n<figcaption>${escapeText(img.title)}</figcaption>\n</figure>`,
      })
    })
  }
}

const CALLOUT_MARKER = /^\[!(NOTE|TIP|WARNING)\][ \t]*/i

function isBlank(node: PhrasingContent): boolean {
  return node.type === 'text' && !node.value.trim()
}

/**
 * Turns a blockquote that starts with a GitHub alert marker (`> [!NOTE]`,
 * `> [!TIP]`, `> [!WARNING]`) into an `<aside>` callout. The rest of the
 * marker's line becomes the callout's title.
 */
function remarkCallouts() {
  return (tree: MdastRoot) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0]
      if (first?.type !== 'paragraph') return
      const lead = first.children[0]
      if (lead?.type !== 'text') return
      const match = CALLOUT_MARKER.exec(lead.value)
      if (!match) return
      lead.value = lead.value.slice(match[0].length)

      const title: PhrasingContent[] = []
      for (let child = first.children[0]; child; child = first.children[0]) {
        const newline = child.type === 'text' ? child.value.indexOf('\n') : -1
        if (child.type === 'text' && newline !== -1) {
          title.push({ type: 'text', value: child.value.slice(0, newline) })
          child.value = child.value.slice(newline + 1)
          break
        }
        title.push(child)
        first.children.shift()
      }
      if (first.children.length === 0) node.children.shift()
      if (!title.every(isBlank)) {
        node.children.unshift({
          type: 'paragraph',
          data: { hProperties: { className: ['callout-title'] } },
          children: title,
        })
      }
      node.data = {
        hName: 'aside',
        hProperties: { className: ['callout', `callout-${String(match[1]).toLowerCase()}`] },
      }
    })
  }
}

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function classesOf(node: Element): string[] {
  const value = node.properties.className
  return Array.isArray(value) ? value.map(String) : []
}

/**
 * Points relative media paths at the content folder, and sends local images
 * through Next's image optimizer with a `srcset`, intrinsic size, and lazy
 * loading. HDR images keep their original file so the gain map survives.
 */
function rehypeLocalMedia({ basePath, measure, images }: RenderOptions & { images: string[] }) {
  function walk(nodes: ElementContent[], sizes: string) {
    for (const node of nodes) {
      if (node.type !== 'element') continue
      const classes = classesOf(node)
      const childSizes = classes.includes('alignfull')
        ? SIZES_FULL
        : classes.includes('alignwide')
          ? SIZES_WIDE
          : sizes
      if (MEDIA_TAGS.has(node.tagName)) rewrite(node, childSizes)
      walk(node.children, childSizes)
    }
  }

  function rewrite(node: Element, sizes: string) {
    const src = node.properties.src
    if (typeof src !== 'string' || !src.startsWith('./')) return
    const path = `${basePath}/${src.slice(2)}`
    node.properties.src = path
    if (node.tagName !== 'img') return
    images.push(path)

    const size = measure(path)
    node.properties.loading = 'lazy'
    node.properties.decoding = 'async'
    node.properties.dataLightbox = ''
    if (!size) return

    node.properties.width = size.width
    node.properties.height = size.height
    node.properties.dataFull = fullImageUrl(path, size.width, size.hdr)
    if (size.hdr) return

    const widths = IMAGE_WIDTHS.filter((w) => w <= size.width)
    const set = widths.length > 0 ? widths : [IMAGE_WIDTHS[0]]
    // Browsers without srcset support get a width that fits the article column.
    const fallback = Math.max(...set.filter((w) => w <= 1200))
    node.properties.src = optimizedImageUrl(path, fallback)
    node.properties.srcSet = set.map((w) => `${optimizedImageUrl(path, w)} ${w}w`).join(', ')
    node.properties.sizes = sizes
  }

  return (tree: HastRoot) => {
    walk(tree.children as ElementContent[], SIZES_DEFAULT)
  }
}

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value
  return node.type === 'element' ? node.children.map(textOf).join('') : ''
}

/**
 * Collects the h2 and h3 headings, with the ids rehype-slug gave them, for
 * the table of contents. Headings with no text are skipped.
 */
function rehypeHeadings({ headings }: { headings: Heading[] }) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return
      const text = textOf(node).replace(/\s+/g, ' ').trim()
      if (!text) return
      headings.push({ id: String(node.properties.id), text, depth: node.tagName === 'h2' ? 2 : 3 })
    })
  }
}

/** Shiki themes for each color scheme. CSS picks one with `light-dark()`. */
const CODE_THEMES = { light: 'rose-pine-dawn', dark: 'rose-pine-moon' } as const

/** The `--surface-code` token in `app/styles/tokens.css`, which code blocks sit on. */
export const CODE_BACKGROUND = { light: '#f2eee7', dark: '#161412' } as const

const SHIKI_COLOR = /--shiki-(light|dark):(#[0-9a-f]{3,8})/gi

/**
 * Finishes shiki's code blocks: nudges each token color until it meets WCAG AA
 * on the site's code background, and adds a copy button. The button does
 * nothing until the `CodeCopy` island loads, and CSS hides it without scripts.
 */
function rehypeCodeBlocks() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'span' && typeof node.properties.style === 'string') {
        node.properties.style = node.properties.style.replace(
          SHIKI_COLOR,
          (_, scheme: 'light' | 'dark', color: string) =>
            `--shiki-${scheme}:${readableColor(color, CODE_BACKGROUND[scheme])}`,
        )
      }
      if (node.tagName === 'figure' && 'data-rehype-pretty-code-figure' in node.properties) {
        node.children.push({
          type: 'element',
          tagName: 'button',
          properties: { type: 'button', ariaLabel: 'Copy code', dataCopy: '' },
          children: [],
        })
      }
    })
  }
}

/**
 * Keeps interactive demo markers (`<div data-demo="name"></div>`) only at the
 * top level of the body, emptied, so `Prose` can split the HTML around them.
 * A marker nested inside other markup loses its `data-demo` and stays an
 * empty div.
 */
function rehypeDemos() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element, _, parent) => {
      if (node.properties.dataDemo === undefined) return
      if (parent?.type === 'root' && node.tagName === 'div') node.children = []
      else delete node.properties.dataDemo
    })
  }
}

/** Tags and attributes the pipeline emits, on top of sanitize-html's defaults. */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'figure',
    'figcaption',
    'details',
    'summary',
    'audio',
    'source',
    'button',
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: [
      'src',
      'srcset',
      'sizes',
      'alt',
      'title',
      'width',
      'height',
      'loading',
      'decoding',
      'data-lightbox',
      'data-full',
    ],
    audio: ['controls', 'src', 'preload'],
    source: ['src', 'type'],
    button: ['type', 'aria-label', 'data-copy'],
    pre: ['tabindex', 'data-language', 'data-theme', 'style'],
    code: ['data-language', 'data-theme'],
    span: ['data-line', 'data-highlighted-line', 'style'],
    figure: ['data-rehype-pretty-code-figure', 'style'],
    div: ['data-demo'],
    '*': ['class', 'id'],
  },
}

/** Output of {@link renderMarkdown}. */
export interface RenderedMarkdown {
  /** Sanitized HTML. */
  html: string
  /** Paths under `public/` of the local images in the body, in order. */
  images: string[]
  /** The h2 and h3 headings, in order. */
  headings: Heading[]
}

/**
 * Renders a post or page body: GitHub-flavored Markdown with raw HTML, heading
 * ids and a list of headings, figure captions, callouts, shiki code highlighting with
 * copy buttons, optimized images, and demo markers. The HTML is sanitized,
 * so the page can inject it as-is.
 *
 * @param markdown - The body, without frontmatter.
 * @param options - Where the content's files live and how to measure them.
 * @returns The HTML, the local images it shows, and its headings.
 */
export async function renderMarkdown(
  markdown: string,
  options: RenderOptions,
): Promise<RenderedMarkdown> {
  const images: string[] = []
  const headings: Heading[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFigureCaption)
    .use(remarkCallouts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHeadings, { headings })
    .use(rehypeLocalMedia, { ...options, images })
    .use(rehypePrettyCode, {
      theme: CODE_THEMES,
      keepBackground: false,
      defaultLang: { block: 'plaintext' },
    })
    .use(rehypeCodeBlocks)
    .use(rehypeDemos)
    .use(rehypeStringify)
    .process(markdown)
  return { html: sanitizeHtml(String(file), SANITIZE_OPTIONS), images, headings }
}
