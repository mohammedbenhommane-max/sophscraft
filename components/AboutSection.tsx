import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

// Replace with your own photo at: /public/images/about.jpg
const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80'

export default async function AboutSection() {
  const t = await getTranslations('about')

  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visuel */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-4 -left-4 w-full h-full border border-gold/20" />
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={ABOUT_IMAGE}
                alt="SophsCraft atelier"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-gold/60 pointer-events-none" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-gold/60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-gold/60 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-gold/60 pointer-events-none" />
            </div>
          </div>

          {/* Texte */}
          <div className="order-1 lg:order-2">
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">{t('tag')}</p>
            <h2 className="font-serif text-4xl lg:text-5xl text-charcoal leading-tight mb-8">
              {t('title').split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h2>
            <div className="w-10 h-px bg-gold mb-8" />
            <div className="space-y-5 text-muted text-sm leading-relaxed">
              <p>{t('p1')}</p>
              <p>{t('p2')}</p>
              <p>{t('p3')}</p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-6">
              <div className="text-center sm:text-left">
                <p className="font-serif text-3xl text-charcoal">133+</p>
                <p className="text-xs uppercase tracking-widest text-muted mt-1">{t('stat1Label')}</p>
              </div>
              <div className="hidden sm:block w-px bg-beige" />
              <div className="text-center sm:text-left">
                <p className="font-serif text-3xl text-charcoal">100%</p>
                <p className="text-xs uppercase tracking-widest text-muted mt-1">{t('stat2Label')}</p>
              </div>
              <div className="hidden sm:block w-px bg-beige" />
              <div className="text-center sm:text-left">
                <p className="font-serif text-3xl text-charcoal">5★</p>
                <p className="text-xs uppercase tracking-widest text-muted mt-1">{t('stat3Label')}</p>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/sur-mesure"
                className="inline-block border border-charcoal text-charcoal px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all duration-300"
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
