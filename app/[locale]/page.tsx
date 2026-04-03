import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAllProducts } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import HeroSection from '@/components/HeroSection'
import ProductCard from '@/components/ProductCard'
import CollectionsGrid from '@/components/CollectionsGrid'
import AboutSection from '@/components/AboutSection'
import NewsletterSection from '@/components/NewsletterSection'

export default async function HomePage() {
  const t = await getTranslations('home.explore')

  const allProducts = await getAllProducts()
  const recentProducts = allProducts
    .filter((p) => p.inStock)
    .slice(0, 6)
    .map((p) => ({
      id: p._id,
      slug: p.slug,
      nameFR: p.nameFR,
      nameEN: p.nameEN,
      price: p.price,
      images: p.images?.map((img) => urlFor(img).width(600).url()) ?? [],
      isSoldOut: p.isSoldOut,
    }))

  return (
    <>
      <HeroSection />

      {/* Section "Let's Explore" */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('subtitle')}</p>
          <h2 className="font-serif text-4xl text-charcoal">{t('title')}</h2>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-sm">Les produits arrivent bientôt…</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-block border border-charcoal text-charcoal px-10 py-3.5 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            {t('seeAll')}
          </Link>
        </div>
      </section>

      {/* Section Collections */}
      <div className="bg-beige/40">
        <CollectionsGrid title />
      </div>

      {/* À propos */}
      <AboutSection />

      {/* Newsletter */}
      <NewsletterSection />
    </>
  )
}
