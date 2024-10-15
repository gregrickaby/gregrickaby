import {BackToTop, Footer, Header, JsonLD} from '@/components'
import config from '@/lib/config'
import clsx from 'clsx'
import type {Metadata, Viewport} from 'next'
import {Aleo, Fira_Code, Open_Sans} from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'

const serif = Aleo({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif'
})

const sans = Open_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans'
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
        <NextTopLoader />
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  )
}
