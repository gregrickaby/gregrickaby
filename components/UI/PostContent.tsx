import {Stack, Title, Text, Image, Group, Anchor, Divider} from '@mantine/core'
import sanitizeHtml from 'sanitize-html'
import {hasMediaItem, type Post} from '@/lib/wordpress/types'

export interface PostContentProps {
  post: Post
}

/**
 * Post content component for rendering blog posts.
 */
export function PostContent({post}: Readonly<PostContentProps>) {
  const featuredImage = hasMediaItem(post.featuredImage)
    ? post.featuredImage.node
    : null

  // Format dates
  const publishedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const modifiedDate = new Date(post.modified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Sanitize HTML content
  const sanitizedContent = post.content
    ? sanitizeHtml(post.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'img',
          'figure',
          'figcaption',
          'iframe'
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
          iframe: [
            'src',
            'width',
            'height',
            'frameborder',
            'allowfullscreen',
            'class'
          ],
          a: ['href', 'name', 'target', 'rel', 'class'],
          '*': ['class', 'id']
        },
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
      })
    : ''

  return (
    <article>
      <Stack gap="xl">
        {/* Post Header */}
        <Stack gap="md">
          <Title order={1}>{post.title}</Title>

          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Published {publishedDate}
            </Text>
            {post.date !== post.modified && (
              <>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  Updated {modifiedDate}
                </Text>
              </>
            )}
            {post.author?.node && (
              <>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Text size="sm" c="dimmed">
                  By {post.author.node.name}
                </Text>
              </>
            )}
          </Group>

          {/* Categories and Tags */}
          {(post.categories?.nodes?.length ?? 0) > 0 && (
            <Group gap="xs">
              {post.categories?.nodes?.map((category) => (
                <Anchor
                  key={category.id}
                  href={`/category/${category.slug}`}
                  size="sm"
                  c="blue"
                >
                  {category.name}
                </Anchor>
              ))}
            </Group>
          )}
        </Stack>

        {/* Featured Image */}
        {featuredImage && (
          <Image
            src={featuredImage.sourceUrl}
            alt={featuredImage.altText ?? post.title ?? 'Post image'}
            radius="md"
            fit="cover"
          />
        )}

        <Divider />

        {/* Post Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{__html: sanitizedContent}}
          style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            maxWidth: '100%'
          }}
        />

        {/* Tags */}
        {(post.tags?.nodes?.length ?? 0) > 0 && (
          <>
            <Divider />
            <Group gap="xs">
              <Text size="sm" fw={600}>
                Tags:
              </Text>
              {post.tags?.nodes?.map((tag) => (
                <Anchor
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  size="sm"
                  c="dimmed"
                >
                  #{tag.name}
                </Anchor>
              ))}
            </Group>
          </>
        )}
      </Stack>
    </article>
  )
}
