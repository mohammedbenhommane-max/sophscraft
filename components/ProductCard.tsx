'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useCart, CartItem } from '@/lib/cart-context'

type Product = {
  id: string
  slug: string
  nameFR: string
  nameEN: string
  price: number
  images: string[]
  isSoldOut: boolean
}

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('product')
  const locale = useLocale()
  const { dispatch } = useCart()

  const name = locale === 'fr' ? product.nameFR : product.nameEN
  const image = product.images[0] ?? ''

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (product.isSoldOut) return
    const item: Omit<CartItem, 'quantity'> = {
      id: product.id,
      slug: product.slug,
      nameFR: product.nameFR,
      nameEN: product.nameEN,
      price: product.price,
      image,
    }
    dispatch({ type: 'ADD_ITEM', item })
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-beige rounded-sm">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-beige flex items-center justify-center">
            <svg className="w-8 h-8 text-gold-light" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}

        {product.isSoldOut && (
          <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-muted bg-cream px-3 py-1">
              {t('soldOut')}
            </span>
          </div>
        )}

        {/* Hover overlay — bouton add to cart */}
        {!product.isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-charcoal text-cream py-3 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-200"
            >
              {t('addToCart')}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <h3 className="font-serif text-base text-charcoal group-hover:text-gold transition-colors">{name}</h3>
        <p className="text-sm text-muted">{product.price.toFixed(2)} €</p>
      </div>
    </Link>
  )
}
