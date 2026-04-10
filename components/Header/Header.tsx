'use client'

import {AppLink} from '@/components/AppLink/AppLink'
import {ColorSchemeToggle} from '@/components/ColorSchemeToggle/ColorSchemeToggle'
import {MobileDrawer} from '@/components/MobileDrawer/MobileDrawer'
import {NavLinks} from '@/components/NavLinks/NavLinks'
import {SearchButton} from '@/components/Search/Search'
import {siteConfig} from '@/lib/config'
import {Burger, Container, Group, Title, VisuallyHidden} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'
import Image from 'next/image'

export function Header() {
  const [opened, {toggle, close}] = useDisclosure(false)

  return (
    <header>
      <Container py="xl">
        <Group justify="space-between">
          <AppLink href="/">
            <Group gap="sm">
              <Image
                alt={siteConfig.name}
                height={64}
                priority
                src="/avatar.jpg"
                style={{borderRadius: '100%'}}
                width={64}
              />
              <Title order={1} size="h2">
                {siteConfig.name}
              </Title>
              <VisuallyHidden>{siteConfig.description}</VisuallyHidden>
            </Group>
          </AppLink>

          <Group gap="lg" visibleFrom="sm">
            <NavLinks />
            <SearchButton />
            <ColorSchemeToggle />
          </Group>

          <Group hiddenFrom="sm" gap="xs">
            <SearchButton />
            <Burger
              aria-label={
                opened ? 'Close navigation menu' : 'Open navigation menu'
              }
              opened={opened}
              onClick={toggle}
            />
          </Group>
        </Group>
      </Container>
      <MobileDrawer opened={opened} onClose={close} />
    </header>
  )
}
