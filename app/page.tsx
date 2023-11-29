import config from '@/lib/config'

/**
 * Homepage component.
 */
export default async function Home() {
  return (
    <main className="flex flex-col space-y-8 text-center">
      <p className="text-lg">{config.intro}</p>
    </main>
  )
}
