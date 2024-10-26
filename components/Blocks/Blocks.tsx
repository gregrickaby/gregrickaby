'use client'

import {useEffect, useMemo, useRef} from 'react'
import styles from './Blocks.module.css'

let isFancyboxInitialized = false

/**
 * Initializes Fancybox.
 *
 * - Loads Fancybox CSS and JavaScript from a CDN only when required.
 * - Initializes Fancybox with custom settings after loading.
 *
 * @param {React.RefObject<HTMLDivElement | null>} contentRef - The ref to the content container element.
 * @returns {Promise<void>} A promise that resolves when Fancybox is initialized, or rejects if loading fails.
 */
async function initFancyBox(
  contentRef: React.RefObject<HTMLDivElement | null>
): Promise<void> {
  // Ensure the contentRef and gallery elements exist before proceeding.
  if (!contentRef.current) return

  const gallery = contentRef.current.querySelector('#grd-photo-gallery-gallery')

  // If there's no gallery or Fancybox has already been initialized, exit early.
  if (!gallery || isFancyboxInitialized) return

  try {
    // Dynamically load Fancybox CSS from a CDN.
    const fancyboxCssLink = document.createElement('link')
    fancyboxCssLink.rel = 'stylesheet'
    fancyboxCssLink.href =
      '//cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.css'
    document.head.appendChild(fancyboxCssLink)

    // Dynamically load Fancybox JavaScript from a CDN.
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        '//cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.umd.js'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Fancybox'))
      document.head.appendChild(script)
    })

    // Access Fancybox from the global window object and initialize it.
    const Fancybox = (window as any).Fancybox
    Fancybox.bind('[data-fancybox]', {
      animated: false,
      groupAll: true,
      defaultDisplay: 'flex',
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: ['zoomIn', 'zoomOut', 'toggle1to1'],
          right: ['slideshow', 'thumbs', 'download', 'close']
        }
      }
    })

    // Append custom Fancybox styles to the document head.
    const customStyles = document.createElement('style')
    customStyles.innerHTML = `
      .fancybox__caption {
        text-align: center;
      }
      .fancybox__caption .exif {
        font-size: 12px;
      }
    `
    document.head.appendChild(customStyles)

    // Set initialization flag to true to avoid re-initialization.
    isFancyboxInitialized = true
  } catch (error) {
    console.error('Error loading Fancybox:', error)
  }
}

/**
 * Appends CSS module classes to HTML elements.
 *
 * - Adds specific CSS classes from the CSS module to HTML elements identified
 *   by class or id attributes, ensuring style scoping.
 *
 * @param {string} content - The raw HTML content string to be transformed.
 * @returns {string} - The transformed HTML content with applied CSS module classes.
 */
function appendCssModules(content: string): string {
  return content
    .replace(
      /id="grd-photo-gallery-gallery"/g,
      `id="grd-photo-gallery-gallery" class="${styles.gallery} not-prose"`
    )
    .replace(
      /class="grd-photo-gallery-grid"/g,
      `class="grd-photo-gallery-grid ${styles.grid}"`
    )
    .replace(
      /class="grd-photo-gallery-figure"/g,
      `class="grd-photo-gallery-figure ${styles.figure}"`
    )
    .replace(
      /class="grd-photo-gallery-link"/g,
      `class="grd-photo-gallery-link ${styles.link}"`
    )
    .replace(
      /class="grd-photo-gallery-image"/g,
      `class="grd-photo-gallery-image ${styles.image}"`
    )
    .replace(
      /class="grd-photo-gallery-image-caption"/g,
      `class="grd-photo-gallery-image-caption ${styles.caption}"`
    )
    .replace(
      /class="wp-block-image size-full"/g,
      `class="wp-block-image size-full not-prose"`
    )
    .replace(
      /class="wp-block-image size-large"/g,
      `class="wp-block-image size-large not-prose"`
    )
    .replace(/class="wp-block-video"/g, `class="wp-block-video not-prose"`)
    .replace(
      /class="wp-element-caption"/g,
      `class="wp-element-caption ${styles.singleCaption} not-prose"`
    )
}

/**
 * The Blocks component.
 *
 * Helps customize Gutenberg blocks with custom styles and scripts.
 *
 * @component
 * @param {Readonly<{ content: string }>} props - The component props.
 * @param {string} props.content - The raw HTML content to be rendered.
 */
export function Blocks({content}: Readonly<{content: string}>) {
  // Create a ref to the content container element.
  const contentRef = useRef<HTMLDivElement>(null)

  // Transform the content and memoize the result.
  const transformedContent = useMemo(() => appendCssModules(content), [content])

  /**
   * Initialize Fancybox after content is transformed.
   */
  useEffect(() => {
    initFancyBox(contentRef)
  }, [transformedContent])

  return (
    <div
      className={styles.blocks}
      dangerouslySetInnerHTML={{__html: transformedContent}}
      data-testid="blocks"
      ref={contentRef}
    />
  )
}
