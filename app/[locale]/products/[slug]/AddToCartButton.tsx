'use client'

import { useTranslations } from 'next-intl'
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

export default function AddToCartButton({ product, locale }: { product: Product; locale: string }) {
  const t = useTranslations('product')
  const { dispatch } = useCart()

  if (product.isSoldOut) {
    return (
      <button disabled className="w-full border border-beige text-muted py-4 text-xs uppercase tracking-widest cursor-not-allowed">
        {t('soldOut')}
      </button>
    )
  }

  function handleAdd() {
    const item: Omit<CartItem, 'quantity'> = {
      id: product.id,
      slug: product.slug,
      nameFR: product.nameFR,
      nameEN: product.nameEN,
      price: product.price,
      image: product.images[0] ?? '',
    }
    dispatch({ type: 'ADD_ITEM', item })
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300"
    >
      {t('addToCart')}
    </button>
  )
}
