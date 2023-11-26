import config from '@/lib/config'
import {GravatarData} from '@/lib/types'

/**
 * Homepage component.
 */
export default async function Home() {
  const res = await fetch(config.gravatarUrl)
  const {
    entry: [{aboutMe}]
  }: GravatarData = await res.json()

  return (
    <main className="flex flex-col space-y-8 text-center">
      <p className="text-lg">{aboutMe}</p>
      <a
        aria-label="Read my blog"
        className="mx-auto w-56 rounded bg-zinc-900 py-2 text-lg text-white no-underline shadow-md transition-colors duration-200 hover:bg-zinc-700"
        href="https://gregrickaby.com/blog/"
      >
        Read my blog
      </a>
    </main>
  )
}
