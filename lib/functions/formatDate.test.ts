import {formatDate} from '@/lib/functions'

describe('formatDate', () => {
  it('should format a date object correctly', () => {
    const date = new Date('2024-07-22T10:20:30Z')
    const formattedDate = formatDate(date)
    expect(formattedDate).toBe('Jul 22, 2024')
  })

  it('should format a string date correctly', () => {
    const date = '2024-07-22T10:20:30Z'
    const formattedDate = formatDate(date)
    expect(formattedDate).toBe('Jul 22, 2024')
  })

  it('should format another valid date correctly', () => {
    const date = new Date('2024-12-25T15:30:45Z')
    const formattedDate = formatDate(date)
    expect(formattedDate).toBe('Dec 25, 2024')
  })

  it('should handle invalid date input gracefully', () => {
    expect(() => formatDate(new Date('invalid date'))).toThrow()
  })

  it('should handle an empty date input gracefully', () => {
    expect(() => formatDate(new Date(''))).toThrow()
  })
})
