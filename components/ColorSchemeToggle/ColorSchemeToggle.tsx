'use client'

import {ActionIcon, Box, useMantineColorScheme} from '@mantine/core'
import {IconMoon, IconSun} from '@tabler/icons-react'

/**
 * A toggle button that switches between light and dark color schemes.
 * Displays a sun icon in light mode and a moon icon in dark mode.
 *
 * @returns A React element with the color scheme toggle button.
 */
export function ColorSchemeToggle() {
  const {toggleColorScheme} = useMantineColorScheme()

  return (
    <ActionIcon
      aria-label="Toggle color scheme"
      onClick={toggleColorScheme}
      variant="subtle"
    >
      <Box darkHidden>
        <IconSun size={18} />
      </Box>
      <Box lightHidden>
        <IconMoon size={18} />
      </Box>
    </ActionIcon>
  )
}
