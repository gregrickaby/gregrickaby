import {Analytics} from '@/components/Utils/Analytics/Analytics'
import {siteConfig} from '@/lib/config'
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps
} from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/carousel/styles.css'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: 'website',
    url: '/'
  },
  twitter: {
    card: 'summary',
    title: siteConfig.title,
    description: siteConfig.description
  }
}

/**
 * Create Mantine theme.
 *
 * @see https://mantine.dev/theming/theme-object/
 */
const theme = createTheme({
  components: {
    Anchor: {
      defaultProps: {
        underline: 'never'
      }
    }
  }
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <Analytics />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
