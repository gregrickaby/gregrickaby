import {Carousel} from '@/components/Carousel/Carousel'
import {getCarouselImages} from '@/lib/functions/getCarouselImages'

/**
 * The home page route.
 */
export default async function Home() {
  const images = await getCarouselImages()

  return (
    <>
      <div className="mt-16 text-center md:space-y-16">
        <h1 className="text-4xl font-bold text-shadow-md md:text-7xl">
          👋 Hello there!
        </h1>
        <p className="mx-auto max-w-3xl p-8 text-xl text-shadow-md md:p-0 md:text-3xl md:leading-12">
          I&apos;m a{' '}
          <a
            aria-label="view my photos"
            href="https://flickr.com/photos/gregrickaby"
            rel="author"
          >
            photographer
          </a>
          ,{' '}
          <a
            aria-label="follow on LinkedIn"
            href="https://www.linkedin.com/in/gregrickaby/"
            rel="author"
          >
            web developer
          </a>
          , and{' '}
          <a
            aria-label="view my amazon author profile"
            href="https://www.amazon.com/author/gregrickaby"
            rel="author"
          >
            published author
          </a>
          . Working as Tech Lead at{' '}
          <a href="https://mindsize.com" rel="nofollow">
            Mindsize
          </a>
          .
        </p>
      </div>
      <Carousel images={images} />
    </>
  )
}
