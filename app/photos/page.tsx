import {JsonLd} from '@/components/JsonLd/JsonLd'
import {PhotoGallery} from '@/components/PhotoGallery/PhotoGallery'
import {siteConfig} from '@/lib/config'
import {getPhotos} from '@/lib/photos'
import {buildWebPageGraph} from '@/lib/schema'
import {Box, Container, Skeleton, Text, Title} from '@mantine/core'
import type {Metadata} from 'next'
import {Suspense} from 'react'

const PAGE_TITLE = 'Photos'
const PAGE_DESCRIPTION = 'A collection of my photos.'

/**
 * Generates metadata for the Photos page.
 *
 * @returns Metadata object for SEO.
 */
export function generateMetadata(): Metadata {
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: {
      canonical: '/photos'
    },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
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
    <PhotoGallery
      photos={photos.map(
        ({
          filename,
          title,
          width,
          height,
          camera,
          lens,
          aperture,
          shutterSpeed,
          iso,
          focalLength
        }) => ({
          filename,
          title,
          width,
          height,
          camera,
          lens,
          aperture,
          shutterSpeed,
          iso,
          focalLength
        })
      )}
    />
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: 'photos'
  })

  return (
    <>
      <JsonLd graph={jsonLd} />
      <Container size="xl" py="xl">
        <Box ta="center" mb="xl">
          <Title order={1} mb="xs">
            {PAGE_TITLE}
          </Title>
        </Box>
        <Suspense fallback={<Skeleton height={400} />}>
          <PhotosContent />
        </Suspense>
      </Container>
    </>
  )
}
