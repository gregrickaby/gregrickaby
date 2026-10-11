import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Paragraph, Root as MdastRoot } from 'mdast'
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
    pre: ['tabindex', 'data-language', 'data-theme', 'style'],
    code: ['data-language', 'data-theme'],
    span: ['data-line', 'data-highlighted-line', 'style'],
    figure: ['data-rehype-pretty-code-figure', 'style'],
    '*': ['class', 'id'],
  },
}

/** Output of {@link renderMarkdown}. */
export interface RenderedMarkdown {
  /** Sanitized HTML. */
  html: string
  /** Paths under `public/` of the local images in the body, in order. */
  images: string[]
}

/**
 * Renders a post or page body: GitHub-flavored Markdown with raw HTML, heading
 * ids, figure captions, shiki code highlighting, and optimized images. The
 * HTML is sanitized, so the page can inject it as-is.
 *
 * @param markdown - The body, without frontmatter.
 * @param options - Where the content's files live and how to measure them.
 * @returns The HTML and the local images it shows.
 */
export async function renderMarkdown(
  markdown: string,
  options: RenderOptions,
): Promise<RenderedMarkdown> {
  const images: string[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFigureCaption)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeLocalMedia, { ...options, images })
    .use(rehypePrettyCode, { theme: 'github-dark', keepBackground: true })
    .use(rehypeStringify)
    .process(markdown)
  return { html: sanitizeHtml(String(file), SANITIZE_OPTIONS), images }
}
