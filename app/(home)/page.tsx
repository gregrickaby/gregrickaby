import {Carousel} from '@/components/Carousel/Carousel'
import {HomePage} from '@/components/HomePage/HomePage'
import {getBio} from '@/lib/api/bio'
import {getCarouselImages} from '@/lib/functions/getCarouselImages'

/**
 * The home page route.
 */
export default async function Home() {
  const images = await getCarouselImages()
  const bio = await getBio()

  return (
    <>
      <HomePage bio={bio} />
      <Carousel images={images} />
    </>
  )
}
