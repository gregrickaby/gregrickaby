import Header from '@/components/Header'
import Meta from '@/components/Meta'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Greg Rickaby',
  description: 'Building websites since 1997'
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Meta />
        <Header />
        {children}
      </body>
    </html>
  )
}
