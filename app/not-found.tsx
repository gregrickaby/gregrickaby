import Image from 'next/image'
import Link from 'next/link'

/**
 * Not Found component.
 */
export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404 - Not Found</h1>
      <Image
        alt=""
        className="mx-auto"
        height="160"
        loading="eager"
        src="/404.webp"
        width="160"
        priority={true}
      />
      <p>
        The missing page might be on the{' '}
        <a href="https://web.archive.org/web/20220101000000*/https://gregrickaby.com">
          Wayback Machine
        </a>
        .
      </p>
      <p>
        You could also{' '}
        <span className="rounded-md p-1 font-mono text-sm dark:bg-zinc-400 dark:text-black">
          CMD+K
        </span>{' '}
        or{' '}
        <span className="rounded-md p-1 font-mono text-sm dark:bg-zinc-400 dark:text-black">
          CTRL+K
        </span>{' '}
        to try a search.
      </p>
      <Link href="/">Return Home</Link>
    </div>
  )
}
