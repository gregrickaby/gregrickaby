/**
 * Canonical list of reasons a visitor might use the contact form.
 * This is the single source of truth for both server-side validation
 * and the client-side Mantine Select component.
 */
export const serviceOptions: {value: string; label: string}[] = [
  {value: 'job opportunity', label: 'Job Opportunity'},
  {value: 'consulting', label: 'Consulting'},
  {value: 'speaking or writing', label: 'Speaking or Writing'},
  {value: 'general inquiry', label: 'General Inquiry'},
  {value: 'other', label: 'Other'}
]

/**
 * Union type of all valid service values, derived from the canonical list.
 */
export type Service = (typeof serviceOptions)[number]['value']

const SERVICE_VALUES = new Set(serviceOptions.map((s) => s.value))

/**
 * Type guard that checks whether a string is a valid service value.
 *
 * @param value - The string to check.
 * @returns `true` if `value` is one of the canonical service values.
 */
export function isValidService(value: string): value is Service {
  return SERVICE_VALUES.has(value)
}
