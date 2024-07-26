import {formatDate} from '@/lib/functions'
import {describe, expect, it} from 'vitest'

describe('formatDate', () => {
  it('should format a valid date correctly', () => {
    const date = new Date('2024-07-22T10:20:30Z')
    const formattedDate = formatDate(date)
    expect(formattedDate).toBe('July 22, 2024 at 05:20')
  })

  it('should format another valid date correctly', () => {
    const date = new Date('2024-12-25T15:30:45Z')
    const formattedDate = formatDate(date)
    expect(formattedDate).toBe('December 25, 2024 at 09:30')
  })

  it('should handle invalid date input gracefully', () => {
    expect(() => formatDate(new Date('invalid date'))).toThrow()
  })

  it('should handle an empty date input gracefully', () => {
    expect(() => formatDate(new Date(''))).toThrow()
  })
})
