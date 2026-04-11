import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {NavLinks} from '@/components/NavLinks/NavLinks'
import {SearchButton} from '@/components/Search/Search'
import {Drawer, Group, Stack} from '@mantine/core'

/**
 * Props for the MobileDrawer component.
 *
 * @interface
 */
interface MobileDrawerProps {
  /** Whether the drawer is open. */
  opened: boolean
  /** Callback to close the drawer. */
  onClose: () => void
  /** Current scroll Y position for offset calculation. */
  scrollY: number
}

/**
 * Mobile navigation drawer that slides in from the right.
 * Contains navigation links, search, and color scheme toggle.
 *
 * @param props - The props for the MobileDrawer component.
 * @returns A React element representing the mobile drawer.
 */
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
