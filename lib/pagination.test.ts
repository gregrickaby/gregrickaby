import {PAGE_SIZE, getTotalPages, paginate, parsePage} from './pagination'

describe('parsePage()', () => {
  it('returns 1 when page is undefined', () => {
    expect(parsePage(undefined)).toBe(1)
  })

  it('returns the parsed page number for a valid string', () => {
    expect(parsePage('2')).toBe(2)
  })

  it('clamps page=0 to 1', () => {
    expect(parsePage('0')).toBe(1)
  })

  it('clamps page=-1 to 1', () => {
    expect(parsePage('-1')).toBe(1)
  })

  it('handles NaN input and returns 1', () => {
    expect(parsePage('NaN')).toBe(1)
  })
})

describe('getTotalPages()', () => {
  it('calculates total pages for an exact multiple', () => {
    expect(getTotalPages(28, 14)).toBe(2)
  })

  it('rounds up for a partial last page', () => {
    expect(getTotalPages(15, 14)).toBe(2)
  })

  it('returns 1 when count is 0', () => {
    expect(getTotalPages(0, 14)).toBe(1)
  })

  it('returns 1 when count equals page size', () => {
    expect(getTotalPages(14, 14)).toBe(1)
  })
})

describe('paginate()', () => {
  const items = Array.from({length: 30}, (_, i) => i + 1)

  it('returns page 1 items', () => {
    const result = paginate(items, 1)
    expect(result.currentPage).toBe(1)
    expect(result.items).toEqual(items.slice(0, PAGE_SIZE))
    expect(result.totalPages).toBe(Math.ceil(30 / PAGE_SIZE))
  })

  it('returns correct slice for page 2', () => {
    const result = paginate(items, 2)
    expect(result.currentPage).toBe(2)
    expect(result.items).toEqual(items.slice(PAGE_SIZE, PAGE_SIZE * 2))
  })

  it('returns empty items and totalPages=1 when the list is empty', () => {
    const result = paginate([], 1)
    expect(result.totalPages).toBe(1)
    expect(result.items).toEqual([])
  })

  it('respects a custom pageSize argument', () => {
    const result = paginate(items, 2, 5)
    expect(result.currentPage).toBe(2)
    expect(result.items).toEqual([6, 7, 8, 9, 10])
    expect(result.totalPages).toBe(6)
  })
})
