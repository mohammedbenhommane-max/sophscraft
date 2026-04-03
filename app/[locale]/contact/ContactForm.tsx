'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="py-16 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">{t('successTag')}</p>
        <p className="font-serif text-2xl text-charcoal mb-4">{t('successTitle', { name: form.name })}</p>
        <p className="text-muted text-sm">{t('successText', { email: form.email })}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('nameField')}</label>
          <input name="name" type="text" required value={form.name} onChange={handleChange}
            className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('emailField')}</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange}
            className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('subjectField')}</label>
        <input name="subject" type="text" required value={form.subject} onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('messageField')}</label>
        <textarea name="message" required rows={6} value={form.message} onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none" />
      </div>
      {status === 'error' && <p className="text-red-500 text-sm">{t('errorText')}</p>}
      <button type="submit" disabled={status === 'loading'}
        className="w-full bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300 disabled:opacity-50">
        {status === 'loading' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
