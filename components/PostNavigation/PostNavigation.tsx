import {AppLink} from '@/components/AppLink/AppLink'
import type {PostMeta} from '@/lib/types'
import {Group, Stack, Text} from '@mantine/core'
import {IconArrowLeft, IconArrowRight} from '@tabler/icons-react'
import classes from './PostNavigation.module.css'

interface PostNavigationProps {
  prev: PostMeta | null
  next: PostMeta | null
}

export function PostNavigation({prev, next}: Readonly<PostNavigationProps>) {
  if (!prev && !next) return null

  return (
    <Group justify="space-between" mt="xl" pt="xl" className={classes.navGroup}>
      {prev ? (
        <AppLink href={`/${prev.slug}`} className={classes.navLink}>
          <Stack gap={4}>
            <Group gap={4} c="dimmed">
              <IconArrowLeft size={14} />
              <Text size="xs">Previous</Text>
            </Group>
            <Text fw={500} size="sm">
              {prev.title}
            </Text>
          </Stack>
        </AppLink>
      ) : (
        <span />
      )}

      {next ? (
        <AppLink href={`/${next.slug}`} className={classes.navLink}>
          <Stack gap={4} align="flex-end">
            <Group gap={4} c="dimmed">
              <Text size="xs">Next</Text>
              <IconArrowRight size={14} />
            </Group>
            <Text fw={500} size="sm">
              {next.title}
            </Text>
          </Stack>
        </AppLink>
      ) : (
        <span />
      )}
    </Group>
  )
}
