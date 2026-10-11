import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cacheLife } from 'next/cache'
import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/site'

/** Every share image is 1200x630, the size LinkedIn, Slack, and iMessage expect. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** What goes on a share image. */
export interface OgCard {
  title: string
  /** Small uppercase line above the title, such as the date and category. */
  eyebrow?: string
  /** A photo under `public/` to fill the background, such as `/content/photos/x.jpg`. */
  photo?: string
  /** Show the avatar, name, and domain under the title. Off when the title is the name. */
  byline?: boolean
}

const MIME: Record<string, string> = { '.png': 'image/png', '.webp': 'image/webp' }

/** Cached, so the share image routes prerender at build instead of reading files per request. */
async function dataUrl(publicPath: string): Promise<string> {
  'use cache'
  cacheLife('max')
  const buffer = await readFile(join(process.cwd(), 'public', publicPath))
  const ext = publicPath.slice(publicPath.lastIndexOf('.')).toLowerCase()
  return `data:${MIME[ext] ?? 'image/jpeg'};base64,${buffer.toString('base64')}`
}

/**
 * Renders a share image: the photo full-bleed under a dark gradient, the
 * eyebrow and title in the lower left, and Greg's avatar and domain beneath.
 * Without a photo, the background is the site's warm charcoal.
 */
export async function renderOgImage({
  title,
  eyebrow,
  photo,
  byline = true,
}: OgCard): Promise<ImageResponse> {
  const [background, avatar] = await Promise.all([
    photo ? dataUrl(photo) : Promise.resolve(null),
    dataUrl('/avatar.jpg'),
  ])

  return new ImageResponse(
    <div
      style={{
        background: '#1e1c1a',
        color: '#fff',
        display: 'flex',
        height: '100%',
        position: 'relative',
        width: '100%',
      }}
    >
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only.
        <img
          alt=""
          height={OG_SIZE.height}
          src={background}
          style={{ objectFit: 'cover', position: 'absolute' }}
          width={OG_SIZE.width}
        />
      ) : null}
      <div
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15) 70%)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'flex-end',
          padding: '56px 64px',
          position: 'absolute',
          width: '100%',
        }}
      >
        {eyebrow ? (
          <div
            style={{ fontSize: 22, letterSpacing: 3, opacity: 0.85, textTransform: 'uppercase' }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: title.length > 48 ? 56 : 68,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 12,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {byline ? (
          <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginTop: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only. */}
            <img alt="" height={56} src={avatar} style={{ borderRadius: 28 }} width={56} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{SITE.name}</div>
              <div style={{ color: '#f28043', fontSize: 22 }}>
                {SITE.url.replace('https://', '')}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#f28043', fontSize: 26, marginTop: 24 }}>
            {SITE.url.replace('https://', '')}
          </div>
        )}
      </div>
    </div>,
    OG_SIZE,
  )
}
