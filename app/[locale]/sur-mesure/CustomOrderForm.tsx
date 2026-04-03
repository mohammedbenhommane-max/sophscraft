'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function CustomOrderForm() {
  const t = useTranslations('custom')
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    jewelryType: '',
    occasion: '',
    budget: '',
    materials: '',
    description: '',
  })

  const JEWELRY_TYPES = t.raw('types') as string[]
  const BUDGETS = t.raw('budgets') as string[]

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/custom-order', {
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
        <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto">
          {t('successText', { email: form.email })}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('nameField')} *</label>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('emailField')} *</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          {t('phoneField')} <span className="normal-case">{t('phoneOptional')}</span>
        </label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('typeField')} *</label>
        <select
          name="jewelryType"
          required
          value={form.jewelryType}
          onChange={handleChange}
          className="w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors appearance-none"
        >
          <option value="">{t('typePlaceholder')}</option>
          {JEWELRY_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          {t('occasionField')} <span className="normal-case">{t('occasionHint')}</span>
        </label>
        <input
          name="occasion"
          type="text"
          value={form.occasion}
          onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">{t('budgetField')} *</label>
        <select
          name="budget"
          required
          value={form.budget}
          onChange={handleChange}
          className="w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors appearance-none"
        >
          <option value="">{t('budgetPlaceholder')}</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          {t('materialsField')} <span className="normal-case">{t('materialsHint')}</span>
        </label>
        <input
          name="materials"
          type="text"
          value={form.materials}
          onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">
          {t('descriptionField')} *
        </label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder={t('descriptionPlaceholder')}
          value={form.description}
          onChange={handleChange}
          className="w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/50"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm">{t('errorText')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300 disabled:opacity-50"
      >
        {status === 'loading' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
