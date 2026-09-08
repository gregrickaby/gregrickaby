import {resumeEntries} from './resume'

describe('resumeEntries', () => {
  it('lists the most recent role first', () => {
    expect(resumeEntries[0].company).toBe('Mindsize')
    expect(resumeEntries[0].dateRange).toContain('Present')
  })

  it('gives every entry the required fields', () => {
    for (const entry of resumeEntries) {
      expect(entry.role).toBeTruthy()
      expect(entry.company).toBeTruthy()
      expect(entry.location).toBeTruthy()
      expect(entry.dateRange).toBeTruthy()
      expect(entry.summary).toBeTruthy()
      expect(entry.highlights.length).toBeGreaterThan(0)
    }
  })

  it('only links companies with a known website', () => {
    const mindsize = resumeEntries.find((entry) => entry.company === 'Mindsize')
    expect(mindsize?.companyUrl).toBe('https://mindsize.com')

    const wpforms = resumeEntries.find(
      (entry) => entry.company === 'WPForms.com'
    )
    expect(wpforms?.companyUrl).toBeUndefined()
  })
})
