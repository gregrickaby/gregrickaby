import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Meta from '@/components/JsonLd'
import {PreloadResources} from '@/components/PreloadResources'
import config from '@/lib/config'
import type {Metadata} from 'next'
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
    images: [
      {
        url: config.siteOgImage,
        width: 1175,
        height: 882
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  themeColor: '#111111',
  manifest: '/manifest.json'
}

/**
 * Root layout component.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <PreloadResources />
      <body
        className={`container mx-auto space-y-8 p-12 ${googleFont.className}`}
      >
        <Meta />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
