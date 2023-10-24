export default function Header() {
  return (
    <>
      <header className="flex flex-col gap-8 justify-center text-center px-0 py-8">
        <img
          alt="Greg Rickaby"
          className="h-24 w-24 mx-auto my-0 rounded-[100%]"
          height={96}
          loading="eager"
          src="/logo.webp"
          width={96}
        />
        <h1 className="text-4xl leading-[0]">Greg Rickaby</h1>
        <p>
          Disney Dad. Photographer. Published Author. Dev Team Lead at WPForms
        </p>
        <a
          aria-label="Read Greg's blog"
          className="button"
          href="https://gregrickaby.com/blog"
        >
          Read my blog
        </a>
      </header>
    </>
  )
}
