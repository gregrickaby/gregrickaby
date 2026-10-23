import type { Metadata } from 'next'

import { JsonLd } from '@/components/json-ld'
import { PageTitle } from '@/components/page-title'
import { PhotoGallery } from '@/components/photo-gallery'
import { getPhotos } from '@/lib/content'
import { buildWebPageGraph } from '@/lib/schema'
import { SITE } from '@/lib/site'

const TITLE = 'Photos'
const DESCRIPTION = 'A collection of my photos.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/photos' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE.url}/photos` },
}

export default function PhotosPage() {
  const photos = getPhotos()
  return (
    <>
      <JsonLd
        graph={buildWebPageGraph({ title: TITLE, description: DESCRIPTION, path: 'photos' })}
      />
      <PageTitle>{TITLE}</PageTitle>
      {photos.length > 0 ? <PhotoGallery photos={photos} /> : <p>No photos yet.</p>}
    </>
  )
}
