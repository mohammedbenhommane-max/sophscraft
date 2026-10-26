// Redirections des anciennes adresses du site Shopify (relevées dans Google Search Console, 404 du 23/10/2026).
// Les adresses /fr/... sont d'abord ramenées vers /... par next-intl, puis passent par ces règles.

// Anciens bijoux → nouveau bijou équivalent, ou collection la plus proche
const OLD_PRODUCTS = {
  ibiza: '/products/ibiza-1',
  bali: '/products/bali-1',
  'summer-vibes': '/collections/bracelets',
  'summer-vibes-3': '/collections/bracelets',
  'collection-summer-vibes': '/collections/bracelets',
  'collier-prestige-avec-pendentif-jade': '/collections/colliers',
  'collier-eclat-lunaire': '/collections/colliers',
  'collier-eclat-lunaire-1': '/collections/colliers',
  'earthen-majesty-the-serpentine-and-labradorite-bead-necklace': '/collections/colliers',
  'myriame-sautoire': '/collections/colliers',
  'bague-florence': '/collections/bagues',
  'emerald-oasis-signet-ring-a-regal-touch': '/collections/bagues',
  'serpentine-enchantment-open-ring': '/collections/bagues',
  'classic-pearl-studs': '/collections/boucles-doreilles',
}
// Anciens bijoux sans équivalent identifiable → toutes les collections
const DISCONTINUED_PRODUCTS = [
  'sonia', 'sopnia', 'vagues-dargent', 'voile-de-perles', 'harmonie-verte', 'harmonie-violette',
  'serenite-naturelle', 'prisme', 'elegance-victorienne', 'obsidienne-de-bruxelles', 'elegance-pink',
  'pearl-cascade-elegance', 'marbre-vert', 'maeva', 'rubis-de-bordeaux', 'noir-et-blanc-collection',
  'noir-et-blanc-collection-2', 'gift-card', 'rosalie', 'hope', 'date-me', 'douceur-rosee',
  'lazuli-de-liege', 'zahra', 'rosalia', 'parure-elegante-pour-les-fetes',
]

const OLD_POSTS = {
  'entretien-de-vos-bijoux-artisanaux-conseils-pour-preserver-leur-eclat': '/blog/entretien-bijoux-artisanau',
  'pourquoi-choisir-des-bijoux-faits-main-pour-vos-cadeaux-de-noel': '/blog/idees-cadeaux-bijoux',
  'offrez-des-bijoux-faits-main-pour-une-saint-valentin-inoubliable-a-lasne-et-dans-le-brabant-wallon':
    '/blog/idees-cadeaux-bijoux',
}

const OLD_COLLECTIONS = {
  all: '/collections',
  frontpage: '/collections',
  'silver-collection': '/collections',
  rings: '/collections/bagues',
  'rings-1': '/collections/bagues',
  necklaces: '/collections/colliers',
  earrings: '/collections/boucles-doreilles',
}

const permanent = (source, destination) => ({ source, destination, permanent: true })

export const shopifyRedirects = [
  ...Object.entries(OLD_PRODUCTS).map(([slug, to]) => permanent(`/products/${slug}`, to)),
  ...DISCONTINUED_PRODUCTS.map((slug) => permanent(`/products/${slug}`, '/collections')),
  // Shopify : /collections/<collection>/products/<bijou>
  permanent('/collections/:collection/products/:slug', '/products/:slug'),
  ...Object.entries(OLD_COLLECTIONS).map(([slug, to]) => permanent(`/collections/${slug}`, to)),

  ...Object.entries(OLD_POSTS).flatMap(([slug, to]) => [
    permanent(`/blogs/news/${slug}`, to),
    permanent(`/blogs/inspirations/${slug}`, to),
  ]),
  permanent('/blogs/:blog/:post', '/blog'),
  permanent('/blogs/:blog', '/blog'),

  permanent('/pages/contact', '/contact'),
  permanent('/pages/sur-mesure', '/sur-mesure'),
  permanent('/pages/rendez-vous-pour-conception-et-personnalisation-de-bijoux', '/rendez-vous'),
  permanent('/pages/:page', '/'),
  permanent('/policies/privacy-policy', '/privacy'),
  permanent('/policies/:policy', '/cgv'),
  permanent('/search', '/collections'),
  permanent('/search/:path*', '/collections'),
  permanent('/custom-page-url', '/'),
]
