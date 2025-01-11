import Photos from '@/components/Photos/Photos'
import getPhotos from '@/lib/api/cloudinary'
import config from '@/lib/config'
import {Metadata} from 'next'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `Photos - ${config.siteName}`,
    description:
      'Explore my portfolio featuring the magic of Disney World, serene landscapes from camping adventures, and breathtaking astrophotography. Each image invites you into unique worlds of beauty and discovery.',
    alternates: {
      canonical: '/photos'
    }
  }
}

/**
 * Photos page.
 */
export default async function PhotosPage() {
  // Get all photos from Cloudinary.
  const photos = await getPhotos()

  // Get the Cloudinary cloud name.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? ''

  return (
    <div className="article px-12 lg:px-0">
      <h1 className="text-center">Photos</h1>
      <p className="text-center">
        Discover my diverse collection of photographs, each showcasing unique
        style and technique. For the best viewing experience, please use{' '}
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Chrome
        </a>{' '}
        on an HDR display.
      </p>
      <Photos photos={photos} cloudName={cloudName} />
    </div>
  )
}
