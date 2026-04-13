import {AppLink} from '@/components/AppLink/AppLink'
import {Box, Text, Title} from '@mantine/core'
import {headers} from 'next/headers'

export default async function NotFound() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? 'unknown'
  console.info(`[404] Not found: ${pathname}`)

  return (
    <Box ta="center">
      <Title order={1} mb="md">
        404
      </Title>
      <Text size="lg" c="dimmed" mb="lg">
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>
      <AppLink href="/" style={{color: 'var(--mantine-color-anchor)'}}>
        Go back home
      </AppLink>
    </Box>
  )
}
