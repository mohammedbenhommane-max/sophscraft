const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'

// Canonical + hreflang pour une page statique (path = '' pour l'accueil, '/contact', ...)
export function localeAlternates(locale: string, path = '') {
  const fr = `${BASE_URL}${path}`
  const en = `${BASE_URL}/en${path}`
  return {
    canonical: locale === 'en' ? en : fr,
    languages: { fr, en },
  }
}
