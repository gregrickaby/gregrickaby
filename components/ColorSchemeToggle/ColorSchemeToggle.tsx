'use client'

import {ActionIcon, Box, useMantineColorScheme} from '@mantine/core'
import {IconMoon, IconSun} from '@tabler/icons-react'

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
