import config from '@/lib/config'
import {GravatarData} from '@/lib/types'

/**
 * Header component.
 */
export default async function Header() {
  const res = await fetch(config.gravatarUrl)
  const {
    entry: [{displayName, thumbnailUrl}]
  }: GravatarData = await res.json()

  return (
    <header className="flex flex-col justify-center gap-8 text-center">
      <img
        alt="Greg Rickaby"
        className="mx-auto h-24 w-24 rounded-full shadow-lg"
        height={96}
        loading="eager"
        src={thumbnailUrl}
        width={96}
      />
      <h1 className="text-4xl font-bold leading-none">{displayName}</h1>
    </header>
  )
}
