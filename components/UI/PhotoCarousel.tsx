'use client'

import {Carousel} from '@mantine/carousel'
import {Image, Box, Text, Stack} from '@mantine/core'
import '@mantine/carousel/styles.css'

/**
 * Photo interface for carousel items.
 */
export interface Photo {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
}

export interface PhotoCarouselProps {
  photos: Photo[]
}

/**
 * Photo carousel component for homepage.
 *
 * Displays a collection of photographs in an interactive carousel.
 */
export function PhotoCarousel({photos}: Readonly<PhotoCarouselProps>) {
  if (!photos || photos.length === 0) {
    return (
      <Box p="xl" ta="center">
        <Text c="dimmed">No photos to display</Text>
      </Box>
    )
  }

  return (
    <Carousel withIndicators height="80vh" slideGap="md">
      {photos.map((photo) => (
        <Carousel.Slide key={photo.id}>
          <Stack gap={0} h="100%">
            <Box style={{flex: 1, position: 'relative'}}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fit="contain"
                h="100%"
                w="100%"
              />
            </Box>
            {(photo.title || photo.description) && (
              <Box p="md" bg="dark.8" c="white">
                {photo.title && (
                  <Text size="lg" fw={600}>
                    {photo.title}
                  </Text>
                )}
                {photo.description && (
                  <Text size="sm" c="dimmed">
                    {photo.description}
                  </Text>
                )}
              </Box>
            )}
          </Stack>
        </Carousel.Slide>
      ))}
    </Carousel>
  )
}
