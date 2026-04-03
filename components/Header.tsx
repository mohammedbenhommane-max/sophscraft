'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from '@/lib/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount, dispatch } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/collections', label: t('collections') },
    { href: '/sur-mesure', label: t('custom') },
    { href: '/rendez-vous', label: t('appointment') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  function switchLocale() {
    const next = locale === 'fr' ? 'en' : 'fr'
    router.replace(pathname, { locale: next })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 group">
            <Image
              src="/images/logo-icon.png"
              alt=""
              width={72}
              height={72}
              className="h-16 w-auto object-contain"
              priority
            />
            <span className="font-serif text-2xl text-charcoal tracking-wide -ml-1 group-hover:text-gold transition-colors duration-300">
              SophsCraft
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-sans uppercase tracking-widest text-muted hover:text-gold transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Langue */}
            <button
              onClick={switchLocale}
              className="text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors"
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* Panier */}
            <button
              onClick={() => dispatch({ type: 'OPEN' })}
              className="relative flex items-center gap-1 text-charcoal hover:text-gold transition-colors"
              aria-label="Panier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-charcoal"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-cream border-t border-beige">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-sans uppercase tracking-widest text-muted hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
