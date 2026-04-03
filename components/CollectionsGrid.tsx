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

const FALLBACK_IMAGE: Record<string, string> = {
  colliers: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
  bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80',
  'boucles-doreilles': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80',
  bagues: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80',
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
          const fallbackImg = FALLBACK_IMAGE[col.slug]
          const imgSrc = col.image ? urlFor(col.image).width(500).url() : fallbackImg
          return (
            <Link key={col.slug} href={`/collections/${col.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-beige">
              {imgSrc ? (
                <Image
                  src={imgSrc}
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
