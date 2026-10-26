import type { Metadata } from 'next'

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

// Descriptions affichées sous le titre dans Google (≈ 150 caractères max)
const DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  '': {
    fr: "Bijoux artisanaux faits main en Belgique : colliers, bracelets, bagues et boucles d'oreilles en pierres naturelles. Pièces uniques et créations sur-mesure.",
    en: 'Handmade artisan jewelry from Belgium: necklaces, bracelets, rings and earrings with natural stones. One-of-a-kind pieces and custom creations.',
  },
  '/collections': {
    fr: "Découvrez nos collections de bijoux faits main : colliers, bracelets, bagues et boucles d'oreilles en pierres naturelles, chaque pièce est unique.",
    en: 'Discover our handmade jewelry collections: necklaces, bracelets, rings and earrings with natural stones, each piece one of a kind.',
  },
  '/blog': {
    fr: "Inspirations et conseils de l'atelier SophsCraft : pierres semi-précieuses, entretien des bijoux, idées cadeaux et bijoux sur-mesure.",
    en: 'Inspiration and advice from the SophsCraft workshop: semi-precious stones, jewelry care, gift ideas and custom jewelry.',
  },
  '/contact': {
    fr: 'Une question, une commande spéciale, un simple bonjour ? Écrivez à SophsCraft, nous vous répondons sous 24h.',
    en: 'A question, a special order, or just to say hello? Write to SophsCraft, we reply within 24 hours.',
  },
  '/sur-mesure': {
    fr: 'Votre bijou, votre histoire : décrivez votre projet et SophsCraft crée une pièce unique pour vous. Proposition personnalisée sous 48h.',
    en: 'Your jewelry, your story: describe your idea and SophsCraft will create a unique piece for you. Personalised proposal within 48 hours.',
  },
  '/rendez-vous': {
    fr: 'Rencontrons-nous : venez découvrir nos créations, parler de votre projet sur-mesure ou partager votre passion pour les bijoux artisanaux.',
    en: 'Let’s meet: come and discover our creations, talk about your custom project or share your passion for handmade jewelry.',
  },
  '/cgv': {
    fr: 'Conditions générales de vente de la boutique SophsCraft : commandes, paiement, livraison, retours et garanties.',
    en: 'SophsCraft terms and conditions of sale: orders, payment, delivery, returns and warranties.',
  },
  '/legal': {
    fr: 'Mentions légales du site SophsCraft : éditeur, hébergement et propriété intellectuelle.',
    en: 'SophsCraft legal notice: publisher, hosting and intellectual property.',
  },
  '/privacy': {
    fr: 'Comment SophsCraft collecte, utilise et protège vos données personnelles, et comment exercer vos droits.',
    en: 'How SophsCraft collects, uses and protects your personal data, and how to exercise your rights.',
  },
}

export function staticPageMetadata(locale: string, path: string, title?: string): Metadata {
  const description = DESCRIPTIONS[path]?.[locale === 'en' ? 'en' : 'fr']
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: localeAlternates(locale, path),
  }
}

// Certains noms de produits dans Sanity contiennent déjà « | SophsCraft - … » :
// on garde la partie avant le premier « | » pour éviter les titres à rallonge
export function cleanProductName(name: string) {
  return name.split(' | ')[0].trim()
}

// Texte brut d'une description Sanity (Portable Text), pour Google et les flux produits
export function portableTextToPlain(blocks?: { children?: { text?: string }[] }[]) {
  return (blocks ?? [])
    .map((block) => (block.children ?? []).map((child) => child.text ?? '').join(''))
    .join('\n\n')
    .trim()
}
