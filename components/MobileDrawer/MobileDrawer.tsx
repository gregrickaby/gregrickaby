import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {NavLinks} from '@/components/NavLinks/NavLinks'
import {SearchButton} from '@/components/Search/Search'
import {Drawer, Group, Stack} from '@mantine/core'

interface MobileDrawerProps {
  opened: boolean
  onClose: () => void
  scrollY: number
}

export function MobileDrawer({
  opened,
  onClose,
  scrollY
}: Readonly<MobileDrawerProps>) {
  const offset = scrollY > 50 ? '60px' : '73px'

  return (
    <Drawer.Root opened={opened} onClose={onClose} position="right">
      <Drawer.Overlay backgroundOpacity={0} />
      <Drawer.Content style={{top: offset}}>
        <Drawer.Body>
          <Stack gap="md" p="md">
            <NavLinks onClick={onClose} />
            <Group>
              <SearchButton />
              <ColorSchemeToggle />
            </Group>
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
