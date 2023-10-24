/**
 * Header component.
 */
export default function Header() {
  return (
    <header className="flex flex-col justify-center gap-8 text-center">
      <img
        alt="Greg Rickaby"
        className="mx-auto h-24 w-24 rounded-full shadow-lg"
        height={96}
        loading="eager"
        src="/logo.webp"
        width={96}
      />
      <h1 className="text-4xl font-bold leading-none">Greg Rickaby</h1>
    </header>
  )
}
