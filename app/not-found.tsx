import Image from 'next/image'
import Link from 'next/link'

/**
 * Not Found component.
 */
export default function NotFound() {
  return (
    <main className="flex flex-col space-y-8 text-center">
      <h1 className="text-3xl font-bold">404 - Not Found</h1>
      <Image
        alt=""
        className="mx-auto"
        height="160"
        loading="eager"
        src="/404.webp"
        width="160"
      />
      <p>
        The missing page might be on the{' '}
        <a href="https://web.archive.org/web/20220101000000*/https://gregrickaby.com">
          Wayback Machine
        </a>
        .
      </p>
      <Link href="/">Return Home</Link>
    </main>
  )
}
