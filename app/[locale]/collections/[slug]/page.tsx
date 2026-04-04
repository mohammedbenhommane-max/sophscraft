import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCollectionBySlug, getProductsByCollection } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import CollectionFilter from '@/components/CollectionFilter'

type Props = {
  params: { slug: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)
  if (!collection) return { title: 'Collection introuvable' }
  const name = params.locale === 'en' ? collection.nameEN : collection.nameFR
  const description =
    collection.description ??
    (params.locale === 'en'
      ? `Discover our ${name} collection — handmade artisan jewelry by SophsCraft.`
      : `Découvrez notre collection ${name} — bijoux artisanaux faits main par SophsCraft.`)
  const imageUrl = collection.image ? urlFor(collection.image).width(1200).url() : undefined
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'
  const frUrl = `${base}/collections/${params.slug}`
  const enUrl = `${base}/en/collections/${params.slug}`
  return {
    title: name,
    description,
    alternates: {
      canonical: params.locale === 'fr' ? frUrl : enUrl,
      languages: { fr: frUrl, en: enUrl },
    },
    openGraph: {
      title: name,
      description,
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: name }] }),
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug, locale } = params
  const t = await getTranslations('collections')

  const [collection, sanityProducts] = await Promise.all([
    getCollectionBySlug(slug),
    getProductsByCollection(slug),
  ])

  if (!collection) notFound()

  const collectionName = locale === 'en' ? collection.nameEN : collection.nameFR

  const products = sanityProducts.map((p) => ({
    id: p._id,
    slug: p.slug,
    nameFR: p.nameFR,
    nameEN: p.nameEN,
    price: p.price,
    images: p.images?.map((img) => urlFor(img).width(600).url()) ?? [],
    isSoldOut: p.isSoldOut,
  }))

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-beige/40 py-20 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('title')}</p>
        <h1 className="font-serif text-5xl text-charcoal">{collectionName}</h1>
        {collection.description && (
          <p className="text-muted text-sm mt-3 max-w-md mx-auto">{collection.description}</p>
        )}
        <p className="text-muted text-xs mt-2">
          {products.length === 1 ? t('pieces', { count: products.length }) : t('piecesPlural', { count: products.length })}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <CollectionFilter products={products} />
      </div>
    </div>
  )
}
