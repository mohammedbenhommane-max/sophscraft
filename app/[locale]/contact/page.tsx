import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactForm from './ContactForm'

export const metadata: Metadata = { title: 'Contact — SophsCraft' }

export default async function ContactPage() {
  const t = await getTranslations('contact')

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('tag')}</p>
          <h1 className="font-serif text-5xl text-charcoal mb-6">{t('title')}</h1>
          <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="lg:col-span-2 space-y-10">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold mb-4">{t('emailLabel')}</h3>
              <a href="mailto:contact@sophscraft.com" className="text-sm text-charcoal hover:text-gold transition-colors">
                contact@sophscraft.com
              </a>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold mb-4">{t('socialLabel')}</h3>
              <div className="flex gap-5">
                <a href="https://instagram.com/sophscraft" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors text-sm">Instagram</a>
                <a href="https://tiktok.com/@sophscraft" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors text-sm">TikTok</a>
              </div>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold mb-4">{t('responseLabel')}</h3>
              <p className="text-sm text-muted leading-relaxed">{t('responseText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
