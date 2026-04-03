import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import CustomOrderForm from './CustomOrderForm'

export const metadata: Metadata = { title: 'Sur-mesure — SophsCraft' }

export default async function SurMesurePage() {
  const t = await getTranslations('custom')

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-beige/40 py-20 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('tag')}</p>
        <h1 className="font-serif text-5xl text-charcoal mb-6">{t('title')}</h1>
        <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">{t('subtitle')}</p>
      </div>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {[
            { step: t('step1Number'), title: t('step1Title'), desc: t('step1Desc') },
            { step: t('step2Number'), title: t('step2Title'), desc: t('step2Desc') },
            { step: t('step3Number'), title: t('step3Title'), desc: t('step3Desc') },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <p className="font-serif text-5xl text-gold/30 mb-3">{step}</p>
              <h3 className="font-serif text-xl text-charcoal mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">{t('formTag')}</p>
            <h2 className="font-serif text-3xl text-charcoal">{t('formTitle')}</h2>
          </div>
          <CustomOrderForm />
        </div>
      </section>
    </div>
  )
}
