import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { staticPageMetadata } from '@/lib/seo'
import CollectionsGrid from '@/components/CollectionsGrid'

// Page mise en cache, régénérée au plus toutes les 60 s (contenu Sanity)
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return staticPageMetadata(locale, '/collections', 'Collections')
}

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale)
  const t = await getTranslations('collections')

  return (
    <div className="pt-16">
      {/* Page header */}
      <div className="bg-beige/40 py-20 text-center">
        <p className="text-gold-ink text-xs uppercase tracking-[0.3em] mb-3">{t('subtitle')}</p>
        <h1 className="font-serif text-5xl text-charcoal">{t('title')}</h1>
      </div>

      <CollectionsGrid />
    </div>
  )
}
