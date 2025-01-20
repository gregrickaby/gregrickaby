/**
 * Format shutter speed from decimal to human-readable format.
 *
 * @param decimalSpeed - The shutter speed in decimal form (e.g., 0.001, 1, "0.016").
 * @returns The human-readable shutter speed (e.g., "1/1000 s", "2 s").
 */
export function formatShutterSpeed(decimalSpeed: number | string): string {
  // Convert to number.
  const speed = Number(decimalSpeed)

  // Handle invalid or edge case inputs.
  if (isNaN(speed) || speed <= 0) {
    return ''
  }

  // Check if the shutter speed is a whole number.
  if (speed >= 1) {
    return `${speed}s` // Full seconds
  }

  // Calculate the denominator for fractional speeds.
  const denominator = Math.round(1 / speed)

  // Return the fractional shutter speed.
  return `1/${denominator}s`
}
