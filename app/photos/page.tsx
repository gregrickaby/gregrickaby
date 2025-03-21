import Portfolio from '@/components/Portfolio/Portfolio'
import {fetchPhotos} from '@/lib/api/photos'
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
 * Photos page component.
 */
export default async function PhotosPage() {
  // Get photos from the API.
  const photos = await fetchPhotos()

  return (
    <div className="article px-12 lg:px-0">
      <h1>Photos</h1>
      <p>
        My portfolio features wildlife, landscape, street and astrophotography.
        See more photos on{' '}
        <a
          href={config.socials.find((social) => social.name === 'Flickr')?.url}
          rel="author"
          title="follow on flickr"
        >
          Flickr
        </a>
        .
      </p>

      <Portfolio photos={photos} />
    </div>
  )
}
