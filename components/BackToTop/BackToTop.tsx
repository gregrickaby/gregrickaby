'use client'

import {IconArrowUp} from '@tabler/icons-react'
import clsx from 'clsx'
import {useEffect, useState} from 'react'
import styles from './BackToTop.module.css'

/**
 * The back to top component.
 */
export function BackToTop() {
  const [showButton, setShowButton] = useState(false)
  const buttonText = 'Go back to the top of the page'

  /**
   * Scroll handler.
   */
  const handleScroll = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  /**
   * Effect for showing the back to top button.
   */
  useEffect(() => {
    // Scroll event handler.
    const handleScroll = () => {
      setShowButton(window.scrollY > 200)
    }

    // Add event listener.
    window.addEventListener('scroll', handleScroll)

    // Cleanup event listener.
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return showButton ? (
    <button
      aria-label={buttonText}
      className={clsx('button', styles.backToTop)}
      data-testid="back-to-top"
      onClick={handleScroll}
      title={buttonText}
    >
      <IconArrowUp height="32" width="32" />
      <span className="sr-only">{buttonText}</span>
    </button>
  ) : null
}
