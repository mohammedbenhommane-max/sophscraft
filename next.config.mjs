import createNextIntlPlugin from 'next-intl/plugin'
import { shopifyRedirects } from './shopify-redirects.mjs'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

// L'adresse technique Vercel renvoie vers le vrai domaine, pour éviter un doublon dans Google.
// /api, /studio et /_next restent accessibles : webhooks et Studio peuvent encore passer par elle.
const vercelHost = [{ type: 'host', value: 'sophscraft.vercel.app' }]
const vercelRedirects = [
  { source: '/', has: vercelHost, destination: 'https://www.sophscraft.com/', permanent: true },
  { source: '/:path((?!api/|studio|_next/).+)', has: vercelHost, destination: 'https://www.sophscraft.com/:path', permanent: true },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [...vercelRedirects, ...shopifyRedirects]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Le site ne peut pas être affiché dans une iframe d'un autre site (clickjacking)
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // `payment` reste autorisé pour Apple Pay / Google Pay via Stripe
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
