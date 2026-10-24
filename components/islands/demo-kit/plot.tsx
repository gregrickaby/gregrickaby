import styles from './plot.module.css'

const WIDTH = 300

/**
 * An SVG path through values from -1 to 1, spread across the plot. `steps`
 * holds each value until the next one, like samples in a buffer.
 */
export function toPath(values: readonly number[], steps = false): string {
  const dx = WIDTH / (values.length - 1)
  const y = (value: number) => (50 - value * 40).toFixed(1)
  return values
    .map((value, i) => {
      const x = (i * dx).toFixed(1)
      return i === 0 ? `M0 ${y(value)}` : steps ? `H${x} V${y(value)}` : `L${x} ${y(value)}`
    })
    .join(' ')
}

/**
 * A line drawing of values from -1 to 1, such as a waveform, stretched to the
 * demo's width. Pure SVG, so it renders on the server and without JavaScript.
 */
export function Plot({
  label,
  steps,
  values,
}: {
  label: string
  steps?: boolean
  values: readonly number[]
}) {
  return (
    <svg
      aria-label={label}
      className={styles.plot}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${WIDTH} 100`}
    >
      <line className={styles.axis} x1="0" x2={WIDTH} y1="50" y2="50" />
      <path className={styles.line} d={toPath(values, steps)} />
    </svg>
  )
}
