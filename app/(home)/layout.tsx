import {Footer} from '@/components/Footer/Footer'
import {Header} from '@/components/Header/Header'
import {JsonLD} from '@/components/JsonLd/JsonLd'
import config from '@/lib/config'
import {Analytics} from '@vercel/analytics/next'
import clsx from 'clsx'
import type {Metadata, Viewport} from 'next'
import {Fira_Code, IBM_Plex_Sans, IBM_Plex_Serif} from 'next/font/google'
import './globals.css'

const serif = IBM_Plex_Serif({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700']
})

const sans = IBM_Plex_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '700']
})

const mono = Fira_Code({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-mono'
})

/**
 * Setup default sitewide metadata.
 */
export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: `${config.siteName} - ${config.siteDescription}`,
  description: config.siteDescription,
  robots: {
    follow: true,
    index: true
  },
  alternates: {
    canonical: config.siteUrl,
    types: {
      'application/rss+xml': `${config.siteUrl}/feed.xml`
    }
  },
  openGraph: {
    title: config.siteName,
    description: config.siteDescription,
    url: config.siteUrl,
    siteName: config.siteName,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: config.siteOgImage,
        width: 1175,
        height: 882,
        alt: config.siteName
      }
    ]
  },
  manifest: '/manifest.webmanifest'
}

/**
 * Setup viewport.
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#18181b'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={clsx(sans.variable, serif.variable, mono.variable)}
    >
      <body>
        <JsonLD />
        <Header />
        <main>
          {children}
          <Analytics mode="production" />
        </main>
        <Footer />
      </body>
    </html>
  )
}
