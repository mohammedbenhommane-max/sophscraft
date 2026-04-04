import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'

export const metadata: Metadata = {
  title: {
    default: 'SophsCraft — Bijoux artisanaux faits main',
    template: '%s | SophsCraft',
  },
  description: 'Bijoux artisanaux faits main. Chaque pièce est unique, créée avec amour et précision.',
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'SophsCraft',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/images/logo.png', width: 1200, height: 630, alt: 'SophsCraft — Bijoux artisanaux' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SophsCraft',
  url: 'https://sophscraft.com',
  logo: 'https://sophscraft.com/images/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@sophscraft.com',
    contactType: 'customer service',
  },
  sameAs: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {children}
      </body>
    </html>
  )
}
