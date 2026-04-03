import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-serif text-[120px] leading-none text-beige select-none">404</p>
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3 -mt-4">{t('tag')}</p>
        <h1 className="font-serif text-3xl text-charcoal mb-4">{t('title')}</h1>
        <p className="text-muted text-sm leading-relaxed mb-10">{t('subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-charcoal text-cream px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300"
          >
            {t('backHome')}
          </Link>
          <Link
            href="/collections"
            className="inline-block border border-charcoal text-charcoal px-8 py-3.5 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            {t('seeCollections')}
          </Link>
        </div>
      </div>
    </div>
  )
}
