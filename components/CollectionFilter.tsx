'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ProductCard from './ProductCard'

type Product = {
  id: string
  slug: string
  nameFR: string
  nameEN: string
  price: number
  images: string[]
  isSoldOut: boolean
}

type Filter = 'all' | 'inStock'
type Sort = 'default' | 'priceAsc' | 'priceDesc'

export default function CollectionFilter({ products }: { products: Product[] }) {
  const t = useTranslations('collections')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('default')

  const filtered = products
    .filter((p) => filter === 'all' || !p.isSoldOut)
    .sort((a, b) => {
      if (sort === 'priceAsc') return a.price - b.price
      if (sort === 'priceDesc') return b.price - a.price
      return 0
    })

  const count = filtered.length

  return (
    <>
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-beige">
        {/* Filtre disponibilité */}
        <div className="flex gap-2">
          {(['all', 'inStock'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200 ${
                filter === f
                  ? 'bg-charcoal text-cream'
                  : 'border border-beige text-muted hover:border-charcoal hover:text-charcoal'
              }`}
            >
              {f === 'all' ? t('filterAll') : t('filterInStock')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Compteur */}
          <span className="text-xs text-muted">
            {count === 1 ? t('pieces', { count }) : t('piecesPlural', { count })}
          </span>

          {/* Tri */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="border border-beige bg-transparent px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
          >
            <option value="default">{t('sortDefault')}</option>
            <option value="priceAsc">{t('sortPriceAsc')}</option>
            <option value="priceDesc">{t('sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      {/* Grille produits */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-sm">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}
