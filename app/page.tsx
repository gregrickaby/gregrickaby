/**
 * Home page component.
 */
export default function Home() {
  return (
    <main className="flex flex-col space-y-8 text-center">
      <p className="text-lg">
        Disney Dad. Photographer. Published Author. Dev Team Lead at{' '}
        <a href="https://wpforms.com">WPForms</a>.
      </p>
      <a
        aria-label="Read Greg's blog"
        className="mx-auto w-56 rounded bg-zinc-900 py-2 text-lg text-white shadow-md transition-colors duration-200 hover:bg-zinc-700"
        href="https://gregrickaby.com/blog/"
      >
        Read my blog
      </a>
    </main>
  )
}
