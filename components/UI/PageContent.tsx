import {Stack, Title, Image, Divider} from '@mantine/core'
import sanitizeHtml from 'sanitize-html'
import {hasMediaItem, type Page} from '@/lib/wordpress/types'

export interface PageContentProps {
  page: Page
}

/**
 * Page content component for rendering WordPress pages.
 */
export function PageContent({page}: Readonly<PageContentProps>) {
  const featuredImage = hasMediaItem(page.featuredImage)
    ? page.featuredImage.node
    : null

  // Sanitize HTML content
  const sanitizedContent = page.content
    ? sanitizeHtml(page.content, {
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
        {/* Page Header */}
        <Stack gap="md">
          <Title order={1}>{page.title}</Title>
        </Stack>

        {/* Featured Image */}
        {featuredImage && (
          <Image
            src={featuredImage.sourceUrl}
            alt={featuredImage.altText ?? page.title ?? 'Page image'}
            radius="md"
            fit="cover"
          />
        )}

        <Divider />

        {/* Page Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{__html: sanitizedContent}}
          style={{
            fontSize: '1.125rem',
            lineHeight: '1.75',
            maxWidth: '100%'
          }}
        />
      </Stack>
    </article>
  )
}
