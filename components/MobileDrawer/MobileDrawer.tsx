import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {NavLinks} from '@/components/NavLinks/NavLinks'
import {SearchButton} from '@/components/Search/Search'
import {siteConfig} from '@/lib/config'
import {Drawer, Stack} from '@mantine/core'

interface MobileDrawerProps {
  opened: boolean
  onClose: () => void
}

export function MobileDrawer({opened, onClose}: Readonly<MobileDrawerProps>) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={siteConfig.name}
      padding="md"
      size="xs"
    >
      <Stack>
        <NavLinks onClick={onClose} />
        <SearchButton />
        <ColorSchemeToggle />
      </Stack>
    </Drawer>
  )
}
