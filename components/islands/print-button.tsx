'use client'

import { DownloadIcon } from '@/components/icons'

import styles from './print-button.module.css'
import { playSound } from './sounds'

/**
 * Opens the browser's print dialog, where "Save as PDF" uses the resume's
 * print stylesheet. Hidden until JavaScript runs, since it does nothing without it.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      className={className ? `${styles.button} ${className}` : styles.button}
      onClick={() => {
        playSound('select')
        window.print()
      }}
      type="button"
    >
      <DownloadIcon size={16} /> Save as PDF
    </button>
  )
}
