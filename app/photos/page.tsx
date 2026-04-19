import {PhotoGallery} from '@/components/PhotoGallery/PhotoGallery'
import {siteConfig} from '@/lib/config'
import {getPhotos} from '@/lib/photos'
import {buildWebPageGraph, serializeSchema} from '@/lib/schema'
import {Container, Skeleton, Text, Title} from '@mantine/core'
import type {Metadata} from 'next'
import {Suspense} from 'react'

/**
 * Generates metadata for the Photos page.
 *
 * @returns Metadata object for SEO.
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Photos',
    description: 'A collection of photographs by Greg Rickaby.',
    alternates: {
      canonical: '/photos'
    },
    openGraph: {
      title: 'Photos',
      description: 'A collection of photographs by Greg Rickaby.',
      url: `${siteConfig.url}/photos`
    }
  }
}

/**
 * Async sub-component that loads photo data and renders the gallery.
 * Exported for direct testing of photo content without a Suspense boundary.
 * Isolated so the parent page can stream it in behind a Suspense boundary.
 *
 * @returns A React element with the photo gallery or a "no photos" message.
 */
export async function PhotosContent() {
  const photos = await getPhotos()
  return photos.length > 0 ? (
    <PhotoGallery photos={photos} />
  ) : (
    <Text c="dimmed">No photos yet.</Text>
  )
}

/**
 * The /photos page. Displays a masonry grid of photographs with EXIF metadata,
 * sorted newest to oldest. The gallery streams in behind a Suspense boundary
 * so the page heading renders immediately.
 *
 * @returns A React element with the photos page.
 */
export default function PhotosPage() {
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
        <Suspense fallback={<Skeleton height={400} />}>
          <PhotosContent />
        </Suspense>
      </Container>
    </>
  )
}
