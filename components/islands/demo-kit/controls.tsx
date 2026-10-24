import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './controls.module.css'

/**
 * A wrapping row of buttons and sliders, with an optional pixel-font label
 * first. CSS hides it without JavaScript, since controls need scripts.
 */
export function Controls({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className={styles.controls}>
      {label ? <span className={styles.label}>{label}</span> : null}
      {children}
    </div>
  )
}

/** A play triangle drawn in pixels, to match the site's 8-bit icons. */
function PlayIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} shapeRendering="crispEdges" viewBox="0 0 8 8">
      <path d="M1 0h2v1h2v2h2v2H5v2H3v1H1z" fill="currentcolor" />
    </svg>
  )
}

/**
 * A demo button. `primary` (the default) is for the main action, such as
 * Play; `secondary` is for presets and edits. A button that plays sound
 * passes `playing` instead of children: it reads Play with a triangle, then
 * Stop with bouncing equalizer bars while it's true, and its demo's frame
 * dances along.
 */
export function DemoButton({
  children,
  className,
  playing,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  playing?: boolean
  variant?: 'primary' | 'secondary'
}) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return (
    <button className={classes} data-playing={playing || undefined} type="button" {...props}>
      {playing === undefined ? (
        children
      ) : playing ? (
        <>
          <span aria-hidden="true" className={styles.bars}>
            <span />
            <span />
            <span />
          </span>
          Stop
        </>
      ) : (
        <>
          <PlayIcon />
          Play
        </>
      )}
    </button>
  )
}

/**
 * A labeled range input that shows its value. The shown value is hidden from
 * screen readers, which already announce the slider's own value.
 */
export function Slider({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className={styles.slider}>
      <span className={styles.label}>{label}</span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
      <output aria-hidden="true" className={styles.value}>
        {value}
      </output>
    </label>
  )
}

/** A short note under a demo that explains what it shows right now. */
export function Caption({ children }: { children: ReactNode }) {
  return <p className={styles.caption}>{children}</p>
}
