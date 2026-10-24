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

/**
 * A demo button. `primary` (the default) is for the main action, such as
 * Play; `secondary` is for presets and edits.
 */
export function DemoButton({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button className={classes} type="button" {...props} />
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
