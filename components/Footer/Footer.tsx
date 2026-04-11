import {AppLink} from '@/components/AppLink/AppLink'
import {siteConfig} from '@/lib/config'
import {Container, Group, Stack, Text} from '@mantine/core'
import classes from './Footer.module.css'

/**
 * Site footer component displaying the copyright notice, license info,
 * and social links (GitHub and LinkedIn).
 *
 * @returns A React element with the site footer.
 */
export function Footer() {
  return (
    <footer>
      <Container py="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              &copy; 1981-{new Date().getFullYear()} {siteConfig.name}
            </Text>
            <Text size="sm" c="dimmed">
              Unless otherwise noted, all photos and content are licensed under{' '}
              <AppLink
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.link}
              >
                CC BY-NC-ND 4.0
              </AppLink>
              .
            </Text>
          </Stack>
          <Group gap="md">
            <AppLink
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.link}
            >
              GitHub
            </AppLink>
            <AppLink
              href={siteConfig.author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.link}
            >
              LinkedIn
            </AppLink>
          </Group>
        </Group>
      </Container>
    </footer>
  )
}
