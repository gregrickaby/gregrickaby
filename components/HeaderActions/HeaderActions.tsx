'use client'

import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {SearchButton} from '@/components/Search/Search'

/**
 * Search and color scheme toggle buttons, paired together since they always
 * appear side by side in both the desktop header and the mobile drawer.
 *
 * @returns A React element with the search and color scheme toggle buttons.
 */
export function HeaderActions() {
  return (
    <>
      <SearchButton />
      <ColorSchemeToggle />
    </>
  )
}
