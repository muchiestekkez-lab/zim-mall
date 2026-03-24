import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { auth } from '@/lib/auth'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ZIM MALL — Zimbabwe\'s Premier Online Marketplace',
    template: '%s | ZIM MALL',
  },
  description:
    'Buy and sell anything in Zimbabwe. Connect with local sellers, find great deals on electronics, clothing, vehicles, services and more.',
  keywords: ['Zimbabwe', 'marketplace', 'buy', 'sell', 'online shopping', 'Harare', 'Bulawayo'],
  openGraph: {
    title: 'ZIM MALL — Zimbabwe\'s Premier Online Marketplace',
    description: 'Buy and sell anything in Zimbabwe.',
    type: 'website',
    locale: 'en_ZW',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white">
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
