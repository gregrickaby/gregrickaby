import {Anchor, Card, Group, Image, Stack, Text, Title} from '@mantine/core'
import {hasMediaItem, type Post} from '@/lib/wordpress/types'

export interface PostCardProps {
  post: Post
}

/**
 * Post card component for displaying blog post previews.
 */
export function PostCard({post}: Readonly<PostCardProps>) {
  const featuredImage = hasMediaItem(post.featuredImage)
    ? post.featuredImage.node
    : null

  // Format the date
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Get excerpt without HTML tags
  const excerpt = post.excerpt
    ?.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {featuredImage && (
        <Card.Section>
          <Image
            src={featuredImage.sourceUrl}
            alt={featuredImage.altText ?? post.title ?? 'Post image'}
            height={240}
            fit="cover"
          />
        </Card.Section>
      )}

      <Stack gap="md" mt="md">
        <Title order={2} size="h3">
          <Anchor href={`/${post.slug}`} underline="never" c="inherit">
            {post.title}
          </Anchor>
        </Title>

        {excerpt && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {excerpt}
          </Text>
        )}

        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {formattedDate}
          </Text>
          {post.author?.node && (
            <>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Text size="xs" c="dimmed">
                By {post.author.node.name}
              </Text>
            </>
          )}
        </Group>

        {post.categories?.nodes && post.categories.nodes.length > 0 && (
          <Group gap="xs">
            {post.categories.nodes.map((category) => (
              <Anchor
                key={category.id}
                href={`/category/${category.slug}`}
                size="xs"
                c="blue"
              >
                {category.name}
              </Anchor>
            ))}
          </Group>
        )}
      </Stack>
    </Card>
  )
}
