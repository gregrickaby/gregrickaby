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
