import {headers} from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Not Found route.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/not-found
 */
export default async function NotFound() {
  const headersList = headers()
  const referer = headersList.get('referer')

  return (
    <>
      <h1 className="text-center">404 - Not Found</h1>
      <p className="text-center text-red-500">{referer}</p>
      <p>
        Just a heads up: I&apos;ve given my website a fresh new look, and in the
        process, some pages have found new homes.
      </p>
      <h2 className="text-3xl">
        The issue is my fault, not yours! Here&apos;s what you can do:
      </h2>
      <ol className="text-left">
        <li>
          <strong>Wayback Machine:</strong> If you&apos;re feeling nostalgic or
          can&apos;t find something, the{' '}
          <a href="https://web.archive.org/web/20220101000000*/https://gregrickaby.com">
            Wayback Machine
          </a>{' '}
          might have a snapshot of the old site.
        </li>
        <li>
          <strong>Head Home:</strong> Still lost? Click{' '}
          <Link href="/">Home</Link> to start fresh from the homepage.
        </li>
      </ol>

      <p>Happy exploring! 🌟</p>

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
    </>
  )
}
