'use client'

import {IconArrowUp} from '@tabler/icons-react'
import {useEffect, useState} from 'react'

/**
 * The back to top component.
 */
export default function BackToTop() {
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
      className="button fixed bottom-8 right-3 rounded-full bg-gray-400 p-2 text-white shadow-lg hover:bg-gray-500 lg:right-12 dark:bg-gray-800 hover:dark:bg-gray-700"
      data-testid="back-to-top"
      onClick={handleScroll}
      title={buttonText}
    >
      <IconArrowUp height="32" width="32" />
      <span className="sr-only">{buttonText}</span>
    </button>
  ) : null
}
