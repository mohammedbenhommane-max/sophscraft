'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useCart } from '@/lib/cart-context'

export default function CartSidebar() {
  const t = useTranslations('cart')
  const locale = useLocale()
  const { state, dispatch, itemCount, subtotal } = useCart()

  // Ferme avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE' })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  // Bloque le scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [state.isOpen])

  if (!state.isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-charcoal/40 z-40 backdrop-blur-sm"
        onClick={() => dispatch({ type: 'CLOSE' })}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 flex flex-col animate-slide-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
          <h2 className="font-serif text-xl text-charcoal">
            {t('title')}
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-sans text-muted">({itemCount})</span>
            )}
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE' })}
            className="text-muted hover:text-charcoal transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg className="w-12 h-12 text-beige" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <p className="text-muted text-sm">{t('empty')}</p>
              <button
                onClick={() => dispatch({ type: 'CLOSE' })}
                className="text-xs uppercase tracking-widest text-gold hover:text-gold-dark transition-colors"
              >
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-beige">
              {state.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-beige flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={locale === 'fr' ? item.nameFR : item.nameEN} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-beige" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-charcoal truncate">
                      {locale === 'fr' ? item.nameFR : item.nameEN}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {item.price.toFixed(2)} €
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-beige rounded">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) dispatch({ type: 'REMOVE_ITEM', id: item.id })
                            else dispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: item.quantity - 1 })
                          }}
                          className="px-2 py-0.5 text-muted hover:text-charcoal transition-colors text-sm"
                        >−</button>
                        <span className="px-2 text-sm text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', id: item.id, quantity: item.quantity + 1 })}
                          className="px-2 py-0.5 text-muted hover:text-charcoal transition-colors text-sm"
                        >+</button>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                        className="text-xs text-muted hover:text-red-400 transition-colors"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-charcoal whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-beige px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted uppercase tracking-wider">{t('subtotal')}</span>
              <span className="font-serif text-lg text-charcoal">{subtotal.toFixed(2)} €</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => dispatch({ type: 'CLOSE' })}
              className="block w-full bg-charcoal text-cream text-center py-3.5 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
