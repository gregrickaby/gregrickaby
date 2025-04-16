import {Carousel} from '@/components/Carousel/Carousel'
import {HomePage} from '@/components/HomePage/HomePage'
import {getCarouselImages} from '@/lib/functions/getCarouselImages'

/**
 * The home page route.
 */
export default async function Home() {
  const images = await getCarouselImages()

  return (
    <>
      <HomePage />
      <Carousel images={images} />
    </>
  )
}
