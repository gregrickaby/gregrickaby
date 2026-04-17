import {isValidService, serviceOptions} from './services'

describe('serviceOptions', () => {
  it('contains 5 entries', () => {
    expect(serviceOptions).toHaveLength(5)
  })

  it('each entry has a non-empty value and label', () => {
    for (const option of serviceOptions) {
      expect(typeof option.value).toBe('string')
      expect(option.value.length).toBeGreaterThan(0)
      expect(typeof option.label).toBe('string')
      expect(option.label.length).toBeGreaterThan(0)
    }
  })

  it('contains the expected values', () => {
    const values = serviceOptions.map((s) => s.value)
    expect(values).toContain('monthly retainer')
    expect(values).toContain('website hosting')
    expect(values).toContain('domain management')
    expect(values).toContain('custom development')
    expect(values).toContain('other')
  })
})

describe('isValidService', () => {
  it('returns true for each valid service value', () => {
    for (const option of serviceOptions) {
      expect(isValidService(option.value)).toBe(true)
    }
  })

  it('returns false for an empty string', () => {
    expect(isValidService('')).toBe(false)
  })

  it('returns false for an unknown string', () => {
    expect(isValidService('hacked value')).toBe(false)
  })

  it('returns false for a label instead of a value', () => {
    expect(isValidService('Monthly Retainer')).toBe(false)
  })

  it('returns false for a value with wrong casing', () => {
    expect(isValidService('Other')).toBe(false)
  })
})
