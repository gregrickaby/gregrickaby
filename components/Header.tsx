import config from '@/lib/config'
import Image from 'next/image'

/**
 * Header component.
 */
export default async function Header() {
  return (
    <header className="flex flex-col justify-center gap-8 text-center">
      <Image
        alt="Greg Rickaby"
        className="mx-auto h-24 w-24 rounded-full shadow-lg"
        height={96}
        loading="eager"
        src={config.siteLogo}
        width={96}
      />
      <h1 className="text-4xl font-bold leading-none">{config.siteName}</h1>
    </header>
  )
}
