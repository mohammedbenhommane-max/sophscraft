'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// Replace with your own photo at: /public/images/hero.jpg
const HERO_IMAGE = 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1600&q=80'

export default function HeroSection() {
  const t = useTranslations('home.hero')
  const [visible, setVisible] = useState(false)
  const [hasImage, setHasImage] = useState(true) // eslint-disable-line

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background — photo or gradient fallback */}
      {hasImage ? (
        <Image
          src={HERO_IMAGE}
          alt="SophsCraft hero"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          onError={() => setHasImage(false)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-[#1a1410] to-[#2a1f0e]" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-charcoal/60" />

      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-gold/10 animate-[spin_40s_linear_infinite]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full border border-gold/10 animate-[spin_60s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full border border-gold/10" />
        <div className="absolute top-1/3 left-1/6 w-1 h-1 rounded-full bg-gold/40" />
        <div className="absolute top-2/3 right-1/5 w-1 h-1 rounded-full bg-gold/30" />
        <div className="absolute top-1/5 right-1/3 w-0.5 h-0.5 rounded-full bg-gold/50" />
        <div className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 rounded-full bg-gold/40" />
      </div>

      <div className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="text-gold text-[10px] uppercase tracking-[0.4em] mb-8">{t('tag')}</p>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl text-cream leading-[1.05] mb-8">
          {t('title').split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h1>
        <div className="w-12 h-px bg-gold mx-auto mb-8" />
        <p className="text-cream/70 text-base sm:text-lg mb-12 leading-relaxed max-w-md mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/collections" className="inline-block bg-gold text-charcoal px-10 py-4 text-xs uppercase tracking-widest hover:bg-cream transition-colors duration-300">
            {t('cta')}
          </Link>
          <Link href="/sur-mesure" className="inline-block border border-cream/30 text-cream/70 px-10 py-4 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors duration-300">
            {t('ctaCustom')}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-cream/20">
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-cream/20 to-transparent" />
      </div>
    </section>
  )
}
