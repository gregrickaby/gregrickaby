import {Box, Button, Container, Group, Stack, Text, Title} from '@mantine/core'

/**
 * Homepage.
 */
export default function HomePage() {
  return (
    <Box>
      <Container size="lg" py="xl">
        <Stack gap="xl" align="center" ta="center">
          <Stack gap="md">
            <Title order={1}>Greg Rickaby</Title>
            <Text size="lg" c="dimmed">
              Tech Lead, Published Author, Photographer
            </Text>
          </Stack>

          <Text size="md" maw={600}>
            I&apos;m a Tech Lead at Mindsize, published author, and proud
            survivor of the Geocities era. Outside of work, you&apos;ll find me
            behind a camera, tossing pizzas, or planning the next road trip.
          </Text>

          <Group justify="center" gap="md">
            <Button component="a" href="/blog" variant="filled" size="lg">
              Read My Blog
            </Button>
            <Button component="a" href="/resume" variant="outline" size="lg">
              Resume
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  )
}
