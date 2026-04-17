/**
 * Canonical list of available services offered via the contact form.
 * This is the single source of truth for both server-side validation
 * and the client-side Mantine Select component.
 */
export const serviceOptions: {value: string; label: string}[] = [
  {value: 'monthly retainer', label: 'Monthly Retainer'},
  {value: 'website hosting', label: 'Website Hosting'},
  {value: 'domain management', label: 'Domain Management'},
  {value: 'custom development', label: 'Custom Development'},
  {value: 'other', label: 'Other'}
]

/**
 * Union type of all valid service values, derived from the canonical list.
 */
export type Service = (typeof serviceOptions)[number]['value']

/**
 * Type guard that checks whether a string is a valid service value.
 *
 * @param value - The string to check.
 * @returns `true` if `value` is one of the canonical service values.
 */
export function isValidService(value: string): value is Service {
  return serviceOptions.some((s) => s.value === value)
}
