import {Search} from '@/components/Search/Search'
import config from '@/lib/config'
import {Metadata} from 'next'
import {headers} from 'next/headers'
import Image from 'next/image'

/**
 * Generate metadata.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export function generateMetadata(): Metadata {
  return {
    title: `${config.siteName} | 404 - Not Found`,
    description: `Sorry, the page you're looking for doesn't exist. Please check the URL or return to the homepage.`,
    robots: {
      index: false,
      follow: false
    },
    alternates: {
      canonical: `${config.siteUrl}/404`
    },
    openGraph: {
      title: `${config.siteName} | 404 - Not Found`,
      description: `Sorry, the page you're looking for doesn't exist. Please check the URL or return to the homepage.`,
      url: `${config.siteUrl}/404`,
      type: 'website'
    }
  }
}

/**
 * Not Found route.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/not-found
 */
export default async function NotFound() {
  const headersList = await headers()
  const referer = headersList.get('referer')

  return (
    <article className="article">
      <Image
        alt=""
        className="mx-auto"
        height="160"
        loading="eager"
        priority={true}
        src="/404.webp"
        unoptimized={true}
        width="160"
      />
      <h1 className="text-center">404 - Not Found</h1>
      <p className="text-center text-red-500">{referer}</p>
      <p>
        It looks like this page has moved or no longer exists. Try searching
        below or check the{' '}
        <a href="https://web.archive.org/web/20240101000000*/https://gregrickaby.com">
          Wayback Machine
        </a>
        .
      </p>
      <Search />
    </article>
  )
}
