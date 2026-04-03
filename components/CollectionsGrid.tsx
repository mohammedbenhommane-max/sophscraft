import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { getAllCollections } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

const FALLBACK_GRADIENT: Record<string, string> = {
  colliers: 'from-amber-900/60 to-stone-800/80',
  bracelets: 'from-stone-700/60 to-zinc-800/80',
  'boucles-doreilles': 'from-yellow-900/60 to-amber-800/80',
  bagues: 'from-zinc-700/60 to-stone-900/80',
}

export default async function CollectionsGrid({ title }: { title?: boolean }) {
  const [collections, t, tHome, locale] = await Promise.all([
    getAllCollections(),
    getTranslations('collections'),
    getTranslations('home.collections'),
    getLocale(),
  ])

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      {title && (
        <div className="text-center mb-14">
          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{tHome('subtitle')}</p>
          <h2 className="font-serif text-4xl text-charcoal">{tHome('title')}</h2>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((col) => {
          const gradient = FALLBACK_GRADIENT[col.slug] ?? 'from-stone-800/60 to-zinc-900/80'
          return (
            <Link key={col.slug} href={`/collections/${col.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-beige">
              {col.image ? (
                <Image
                  src={urlFor(col.image).width(500).url()}
                  alt={locale === 'en' ? col.nameEN : col.nameFR}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-beige to-gold/20 group-hover:scale-105 transition-transform duration-700" />
              )}
              <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-70 group-hover:opacity-90 transition-opacity duration-500`} />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-xl text-cream group-hover:text-gold transition-colors duration-300">
                  {locale === 'en' ? col.nameEN : col.nameFR}
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-cream/60 mt-1 block group-hover:text-gold/80 transition-colors duration-300">
                  {t('seeCollection')}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
