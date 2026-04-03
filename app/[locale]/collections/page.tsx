import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import CollectionsGrid from '@/components/CollectionsGrid'

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Collections' }
}

export default async function CollectionsPage() {
  const t = await getTranslations('collections')

  return (
    <div className="pt-16">
      {/* Page header */}
      <div className="bg-beige/40 py-20 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('subtitle')}</p>
        <h1 className="font-serif text-5xl text-charcoal">{t('title')}</h1>
      </div>

      <CollectionsGrid />
    </div>
  )
}
