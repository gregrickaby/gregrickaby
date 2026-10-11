/**
 * Widths requested from Next's image optimizer for images inside post HTML.
 * Each one is in Next's default `deviceSizes`, so the optimizer accepts it.
 */
export const IMAGE_WIDTHS = [640, 828, 1200, 1920] as const

/** Widths used for the lightbox's full-size view, largest last. */
export const FULL_WIDTHS = [1920, 2048, 3840] as const

/**
 * The URL Next's image optimizer serves for a public image at a given width.
 * Post HTML is built ahead of time, outside React, so it can't use `next/image`.
 *
 * @param src - A path under `public/`, such as `/content/posts/x/a.jpg`.
 * @param width - One of Next's allowed widths.
 * @returns The `/_next/image` URL.
 */
export function optimizedImageUrl(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}

/**
 * The image the lightbox opens. HDR photos keep their original file, because
 * re-encoding drops the gain map. Others use the largest optimized width that
 * doesn't exceed the original.
 *
 * @param src - A path under `public/`.
 * @param width - The original's width in pixels.
 * @param hdr - Whether the file carries an HDR gain map.
 * @returns The URL for the full-size view.
 */
export function fullImageUrl(src: string, width: number, hdr: boolean): string {
  if (hdr) return src
  const fit = FULL_WIDTHS.filter((w) => w <= width).at(-1) ?? FULL_WIDTHS[0]
  return optimizedImageUrl(src, fit)
}
