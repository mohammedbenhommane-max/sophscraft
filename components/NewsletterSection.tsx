'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function NewsletterSection() {
  const t = useTranslations('home.newsletter')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-charcoal py-20 px-4">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">Newsletter</p>
        <h2 className="font-serif text-4xl text-cream mb-3">{t('title')}</h2>
        <p className="text-cream/60 text-sm mb-8 leading-relaxed">{t('subtitle')}</p>

        {status === 'success' ? (
          <p className="text-gold text-sm">{t('success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('placeholder')}
              required
              className="flex-1 bg-transparent border border-cream/20 text-cream placeholder-cream/30 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gold text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-gold-light transition-colors duration-200 disabled:opacity-50"
            >
              {status === 'loading' ? '...' : t('button')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
