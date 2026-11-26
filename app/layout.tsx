import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SOCIAL_LINKS } from '@/lib/social'
import { BUSINESS, PRESS } from '@/lib/business'
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
  verification: {
    other: { 'msvalidate.01': '5C89EE563E2F971543A9C4AC1649712B' },
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BUSINESS.name,
  alternateName: BUSINESS.alternateName,
  url: 'https://sophscraft.com',
  logo: 'https://sophscraft.com/images/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@sophscraft.com',
    contactType: 'customer service',
  },
  founder: { '@type': 'Person', name: BUSINESS.founder },
  sameAs: [...Object.values(SOCIAL_LINKS), PRESS.leSoir],
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: BUSINESS.name,
  alternateName: BUSINESS.alternateName,
  url: 'https://sophscraft.com',
  image: 'https://sophscraft.com/images/logo.png',
  description: 'Bijoux artisanaux faits main. Chaque pièce est unique, créée avec amour et précision.',
  telephone: BUSINESS.phoneIntl,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    postalCode: BUSINESS.postalCode,
    addressLocality: BUSINESS.city,
    addressCountry: 'BE',
  },
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Credit Card',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        {children}
        {/* Statistiques de visite Vercel : sans cookies, donc sans bandeau de consentement */}
        <Analytics />
      </body>
    </html>
  )
}
