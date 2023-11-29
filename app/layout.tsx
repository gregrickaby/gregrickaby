import Background from '@/components/Background'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Meta from '@/components/JsonLd'
import {Preload} from '@/components/Preload'
import config from '@/lib/config'
import type {Metadata, Viewport} from 'next'
import {Fira_Sans} from 'next/font/google'
import './globals.css'

/**
 * Setup Google Font.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts#google-fonts
 */
const googleFont = Fira_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700']
})

/**
 * Setup metadata.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#basic-fields
 */
export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: config.siteName,
  description: config.siteDescription,
  robots: 'follow, index',
  alternates: {
    canonical: config.siteUrl
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
  manifest: '/manifest.json'
}

/**
 * Setup viewport.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport#the-viewport-object
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#18181b'
}

/**
 * Root layout component.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <Preload />
      <body className={`${googleFont.className}`}>
        <Meta />
        <div className="relative h-screen w-screen">
          <Background />
          <div className="absolute inset-0 mx-auto space-y-8 p-12">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
