/** Default number of posts per page. */
export const PAGE_SIZE = 14

/**
 * Result of a paginate() call.
 *
 * @template T - The type of items being paginated.
 */
export interface PaginationResult<T> {
  /** The items for the current page. */
  items: T[]
  /** The resolved current page number (1-based, clamped to ≥ 1). */
  currentPage: number
  /** Total number of pages (always at least 1). */
  totalPages: number
}

/**
 * Parse a raw page query string into a clamped, valid page number.
 *
 * Returns 1 for `undefined`, `'0'`, `'-1'`, and `'NaN'`.
 *
 * @param page - The raw page string from `searchParams` (may be `undefined`).
 * @returns A page number clamped to at least 1.
 */
export function parsePage(page: string | undefined): number {
  const parsed = Number.parseInt(page ?? '1', 10)
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed)
}

/**
 * Calculate the total number of pages for a given item count and page size.
 *
 * Always returns at least 1, even when `count` is 0.
 *
 * @param count - Total number of items.
 * @param pageSize - Number of items per page.
 * @returns Total number of pages.
 */
export function getTotalPages(count: number, pageSize: number): number {
  return Math.ceil(count / pageSize) || 1
}

/** `rel="next"`/`rel="prev"` URLs for a paginated listing, per RFC 5988. */
export interface RelLinks {
  /** URL of the next page, or undefined on the last page. */
  nextUrl?: string
  /** URL of the previous page, or undefined on the first page. */
  prevUrl?: string
}

/**
 * Build `rel="next"`/`rel="prev"` URLs for a paginated listing.
 *
 * The previous-page link omits the `?page=` query string when it points
 * back to page 1, since that's the canonical URL for the base listing.
 *
 * @param baseUrl - The listing's canonical URL with no query string (e.g. `siteConfig.url`).
 * @param currentPage - The current page number (1-based).
 * @param totalPages - The total number of pages.
 * @returns An object with `nextUrl` and `prevUrl`, either of which may be undefined.
 */
export function buildRelLinks(
  baseUrl: string,
  currentPage: number,
  totalPages: number
): RelLinks {
  const nextUrl =
    currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : undefined

  let prevUrl: string | undefined
  if (currentPage > 1) {
    prevUrl = currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`
  }

  return {nextUrl, prevUrl}
}

/**
 * Slice an array of items for a given page number.
 *
 * Call `parsePage()` on the raw query string before passing `page` here.
 *
 * @param items - The full list of items to paginate.
 * @param page - The current page number (1-based, already clamped via `parsePage`).
 * @param pageSize - Number of items per page. Defaults to `PAGE_SIZE`.
 * @returns A `PaginationResult` containing the page slice, current page, and total pages.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = PAGE_SIZE
): PaginationResult<T> {
  const currentPage = page
  const totalPages = getTotalPages(items.length, pageSize)
  const start = (currentPage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages
  }
}
