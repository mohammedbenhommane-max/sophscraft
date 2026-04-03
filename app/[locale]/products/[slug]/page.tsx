import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { getProductBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import AddToCartButton from './AddToCartButton'

type Props = {
  params: { slug: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Produit introuvable' }
  return {
    title: params.locale === 'en' ? product.nameEN : product.nameFR,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = params
  const t = await getTranslations('product')

  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const name = locale === 'en' ? product.nameEN : product.nameFR
  const description = locale === 'en' ? product.descriptionEN : product.descriptionFR
  const imageUrls = product.images?.map((img) => urlFor(img).width(900).url()) ?? []
  const collectionSlug = product.collection?.slug ?? ''
  const collectionName = locale === 'en' ? product.collection?.nameEN : product.collection?.nameFR

  const cartProduct = {
    id: product._id,
    slug: product.slug,
    nameFR: product.nameFR,
    nameEN: product.nameEN,
    price: product.price,
    images: imageUrls,
    isSoldOut: product.isSoldOut,
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <nav className="mb-8 text-xs text-muted uppercase tracking-widest flex gap-2 items-center">
          <Link href="/collections" className="hover:text-gold transition-colors">Collections</Link>
          <span>/</span>
          <Link href={`/collections/${collectionSlug}`} className="hover:text-gold transition-colors capitalize">
            {collectionName ?? collectionSlug}
          </Link>
          <span>/</span>
          <span className="text-charcoal">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Galerie */}
          <div className="space-y-4">
            {imageUrls.length > 0 ? (
              <>
                <div className="relative aspect-square overflow-hidden bg-beige rounded-sm">
                  <Image src={imageUrls[0]} alt={name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                {imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imageUrls.slice(1).map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden bg-beige rounded-sm">
                        <Image src={img} alt={`${name} ${i + 2}`} fill className="object-cover" sizes="25vw" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-beige rounded-sm flex items-center justify-center">
                <svg className="w-16 h-16 text-gold-light" fill="none" stroke="currentColor" strokeWidth={0.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="lg:sticky lg:top-24 self-start space-y-6">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">{collectionName}</p>
              <h1 className="font-serif text-4xl text-charcoal">{name}</h1>
            </div>

            <p className="font-serif text-2xl text-charcoal">{product.price.toFixed(2)} €</p>

            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted mb-2">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <span key={v.size} className={`px-3 py-1.5 text-xs border ${v.available ? 'border-charcoal text-charcoal' : 'border-beige text-muted line-through'}`}>
                      {v.size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {description && description.length > 0 && (
              <div className="prose prose-sm text-muted max-w-none">
                <PortableText value={description} />
              </div>
            )}

            <div className="pt-4">
              <AddToCartButton product={cartProduct} locale={locale} />
            </div>

            <div className="border-t border-beige pt-6 space-y-3 text-xs text-muted">
              <div className="flex gap-3 items-start">
                <svg className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span>{t('delivery')}</span>
              </div>
              <div className="flex gap-3 items-start">
                <svg className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <span>{t('handmade')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
