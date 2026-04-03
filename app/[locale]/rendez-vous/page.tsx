import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Rendez-vous — SophsCraft',
}

export default async function RendezVousPage() {
  const t = await getTranslations('appointment')

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-beige/40 py-20 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('tag')}</p>
        <h1 className="font-serif text-5xl text-charcoal mb-6">{t('title')}</h1>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">{t('subtitle')}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-6">{t('whyTitle')}</h2>
            <ul className="space-y-4 text-sm text-muted leading-relaxed">
              {[t('why1'), t('why2'), t('why3'), t('why4')].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-6">{t('howTitle')}</h2>
            <ol className="space-y-5 text-sm text-muted">
              {[
                { n: '01', title: t('step1Title'), desc: t('step1Desc') },
                { n: '02', title: t('step2Title'), desc: t('step2Desc') },
                { n: '03', title: t('step3Title'), desc: t('step3Desc') },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4">
                  <span className="font-serif text-2xl text-gold/40 leading-none">{n}</span>
                  <div>
                    <p className="text-charcoal font-medium mb-1">{title}</p>
                    <p>{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="text-center bg-beige/40 py-14 px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-3">{t('ctaTag')}</p>
          <h3 className="font-serif text-3xl text-charcoal mb-6">{t('ctaTitle')}</h3>
          <p className="text-muted text-sm mb-8 max-w-sm mx-auto">{t('ctaText')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@sophscraft.com?subject=Demande de rendez-vous"
              className="inline-block bg-charcoal text-cream px-10 py-3.5 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300"
            >
              {t('ctaEmail')}
            </a>
            <Link
              href="/sur-mesure"
              className="inline-block border border-charcoal text-charcoal px-10 py-3.5 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all duration-300"
            >
              {t('ctaCustom')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
