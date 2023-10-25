import Link from 'next/link'

/**
 * Not Found component.
 */
export default function NotFound() {
  return (
    <main className="flex flex-col space-y-8 text-center">
      <h1 className="text-3xl font-bold">404 - Not Found</h1>
      <p>
        The missing page might either be on{' '}
        <a href="https://gregrickaby.com/blog/">my blog</a> or on the{' '}
        <a href="https://web.archive.org/web/20220101000000*/https://gregrickaby.com">
          Wayback Machine
        </a>
        .
      </p>
      <Link href="/">Return Home</Link>
      <img
        alt=""
        className="mx-auto"
        height="160"
        loading="eager"
        src="/thor.gif"
        width="160"
      />
    </main>
  )
}
