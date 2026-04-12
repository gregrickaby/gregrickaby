import {PhotoGallery} from '@/components/PhotoGallery/PhotoGallery'
import {siteConfig} from '@/lib/config'
import {getPhotos} from '@/lib/photos'
import {buildWebPageGraph, serializeSchema} from '@/lib/schema'
import {Container, Text, Title} from '@mantine/core'
import type {Metadata} from 'next'

/**
 * Generates metadata for the Photos page.
 *
 * @returns Metadata object for SEO.
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Photos',
    description: 'A collection of photographs by Greg Rickaby.',
    openGraph: {
      title: 'Photos',
      description: 'A collection of photographs by Greg Rickaby.',
      url: `${siteConfig.url}/photos`
    }
  }
}

/**
 * The /photos page. Displays a masonry grid of photographs with EXIF metadata,
 * sorted newest to oldest.
 *
 * @returns A React element with the photos page.
 */
export default async function PhotosPage() {
  const photos = await getPhotos()

  const jsonLd = buildWebPageGraph({
    title: 'Photos',
    description: 'A collection of photographs by Greg Rickaby.',
    path: 'photos'
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: serializeSchema(jsonLd)}}
      />
      <Container size="xl" py="xl">
        <Title order={1} mb="xs">
          Photos
        </Title>
        <Text c="dimmed" mb="xl">
          A collection of photographs by Greg Rickaby.
        </Text>
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} />
        ) : (
          <Text c="dimmed">No photos yet.</Text>
        )}
      </Container>
    </>
  )
}
