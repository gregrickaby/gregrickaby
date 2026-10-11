import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { contentIndex } from '@/tests/helpers/content'
import { renderServer } from '@/tests/helpers/render-server'

vi.mock('@/.generated/content.json', () => ({ default: contentIndex() }))
vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))

const readFile = vi.fn(async (path: string) => Buffer.from(`bytes:${path}`))
vi.mock('node:fs/promises', () => ({ readFile }))

class FakeImageResponse {
  constructor(
    readonly element: ReactElement,
    readonly options: unknown,
  ) {}
}
vi.mock('next/og', () => ({ ImageResponse: FakeImageResponse }))

const { OG_SIZE, renderOgImage } = await import('@/lib/og')

async function html(card: Parameters<typeof renderOgImage>[0]) {
  const image = (await renderOgImage(card)) as unknown as FakeImageResponse
  expect(image.options).toEqual(OG_SIZE)
  return renderServer(image.element)
}

beforeEach(() => readFile.mockClear())

describe('renderOgImage', () => {
  it('draws the photo, eyebrow, title, and byline', async () => {
    const out = await html({ title: 'Moons', eyebrow: 'Jan 11', photo: '/content/a.jpg' })
    expect(out).toContain('data:image/jpeg;base64,')
    expect(out).toContain('Jan 11')
    expect(out).toContain('Moons')
    expect(out).toContain('Greg Rickaby')
    expect(out).toContain('font-size:68px')
    expect(readFile).toHaveBeenCalledTimes(2)
  })

  it('uses the charcoal background without a photo, and a smaller size for long titles', async () => {
    const out = await html({ title: 'A title that runs long enough to need a smaller size' })
    expect(readFile).toHaveBeenCalledTimes(1)
    expect(out).toContain('font-size:56px')
    expect(out).not.toContain('text-transform:uppercase')
  })

  it('drops the byline when the title is the name, and reads PNG types', async () => {
    const out = await html({ title: 'Greg Rickaby', photo: '/x.png', byline: false })
    expect(out).toContain('data:image/png;base64,')
    expect(out.match(/Greg Rickaby/g)).toHaveLength(1)
  })
})
