/**
 * Checks if the updated date is more than one day after the published date.
 *
 * Useful for determining whether to display a "Modified" or "Updated" label
 * on content that has been edited after publishing.
 *
 * @param oldDate - The original published date (ISO 8601 string).
 * @param newDate - The last modified date (ISO 8601 string).
 * @returns `true` if the modified date is more than one day after the published date, otherwise `false`.
 */
export function isModified(oldDate: string, newDate: string) {
  const published = new Date(oldDate)
  const updated = new Date(newDate)
  const msInDay = 1000 * 60 * 60 * 24
  return updated.getTime() - published.getTime() > msInDay
}
