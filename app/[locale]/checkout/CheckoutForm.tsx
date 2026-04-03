'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslations, useLocale } from 'next-intl'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Step = 'contact' | 'shipping' | 'payment'

type ContactInfo = {
  email: string
  firstName: string
  lastName: string
}

type ShippingInfo = {
  address: string
  city: string
  postalCode: string
  country: string
}

function StepIndicator({ current }: { current: Step }) {
  const t = useTranslations('checkout')
  const steps: { key: Step; label: string }[] = [
    { key: 'contact', label: t('stepContact') },
    { key: 'shipping', label: t('stepShipping') },
    { key: 'payment', label: t('stepPayment') },
  ]
  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-colors ${
              i < currentIndex
                ? 'bg-gold border-gold text-charcoal'
                : i === currentIndex
                ? 'bg-charcoal border-charcoal text-cream'
                : 'bg-transparent border-beige text-muted'
            }`}>
              {i < currentIndex ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${i === currentIndex ? 'text-charcoal' : 'text-muted'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-2 mb-5 ${i < currentIndex ? 'bg-gold' : 'bg-beige'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function PaymentForm({ contact, shipping }: { contact: ContactInfo; shipping: ShippingInfo }) {
  const t = useTranslations('checkout')
  const stripe = useStripe()
  const elements = useElements()
  const { dispatch } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        receipt_email: contact.email,
        shipping: {
          name: `${contact.firstName} ${contact.lastName}`,
          address: {
            line1: shipping.address,
            city: shipping.city,
            postal_code: shipping.postalCode,
            country: shipping.country,
          },
        },
      },
    })

    if (submitError) {
      setError(submitError.message ?? t('errorText'))
      setLoading(false)
    } else {
      dispatch({ type: 'CLEAR' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted mb-4">{t('cardDetails')}</h3>
        <div className="border border-beige p-4">
          <PaymentElement />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300 disabled:opacity-50"
      >
        {loading ? '...' : t('pay')}
      </button>
    </form>
  )
}

export default function CheckoutForm() {
  const t = useTranslations('checkout')
  const locale = useLocale()
  const { state, subtotal } = useCart()
  const [step, setStep] = useState<Step>('contact')
  const [contact, setContact] = useState<ContactInfo>({ email: '', firstName: '', lastName: '' })
  const [shipping, setShipping] = useState<ShippingInfo>({ address: '', city: '', postalCode: '', country: 'France' })
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentError, setIntentError] = useState<string | null>(null)

  if (state.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-sm mb-6">{t('emptyCart')}</p>
        <Link href="/collections" className="text-xs uppercase tracking-widest text-charcoal hover:text-gold transition-colors border-b border-charcoal pb-0.5">
          Collections
        </Link>
      </div>
    )
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('shipping')
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/checkout/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        items: state.items,
        shippingAddress: shipping,
      }),
    })
    const data = await res.json()
    if (data.clientSecret) {
      setClientSecret(data.clientSecret)
      setStep('payment')
    } else {
      setIntentError(data.error ?? t('errorText'))
    }
  }

  const inputClass = "w-full border border-beige bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
  const labelClass = "block text-xs uppercase tracking-widest text-muted mb-2"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      {/* Formulaire */}
      <div className="lg:col-span-3">
        <StepIndicator current={step} />

        {step === 'contact' && (
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t('firstName')} *</label>
                <input type="text" required value={contact.firstName}
                  onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('lastName')} *</label>
                <input type="text" required value={contact.lastName}
                  onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('email')} *</label>
              <input type="email" required value={contact.email}
                onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                className={inputClass} />
            </div>
            <button type="submit" className="w-full bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300">
              {t('continueToShipping')}
            </button>
          </form>
        )}

        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>{t('address')} *</label>
              <input type="text" required value={shipping.address}
                onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))}
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t('postalCode')} *</label>
                <input type="text" required value={shipping.postalCode}
                  onChange={(e) => setShipping((p) => ({ ...p, postalCode: e.target.value }))}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t('city')} *</label>
                <input type="text" required value={shipping.city}
                  onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('country')} *</label>
              <input type="text" required value={shipping.country}
                onChange={(e) => setShipping((p) => ({ ...p, country: e.target.value }))}
                className={inputClass} />
            </div>
            {intentError && <p className="text-red-500 text-sm">{intentError}</p>}

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep('contact')}
                className="flex-1 border border-beige text-muted py-4 text-xs uppercase tracking-widest hover:border-charcoal hover:text-charcoal transition-colors">
                ←
              </button>
              <button type="submit"
                className="flex-[3] bg-charcoal text-cream py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors duration-300">
                {t('continueToPayment')}
              </button>
            </div>
          </form>
        )}

        {step === 'payment' && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'flat',
                variables: {
                  colorPrimary: '#C9A96E',
                  colorBackground: '#FAF7F2',
                  fontFamily: 'system-ui, sans-serif',
                },
              },
            }}
          >
            <PaymentForm contact={contact} shipping={shipping} />
          </Elements>
        )}
      </div>

      {/* Récapitulatif */}
      <div className="lg:col-span-2">
        <div className="bg-beige/40 p-6 space-y-4 sticky top-24">
          <h3 className="text-xs uppercase tracking-widest text-muted">{t('orderSummary')}</h3>
          <ul className="divide-y divide-beige">
            {state.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-3 text-sm">
                <div>
                  <p className="text-charcoal font-serif">{locale === 'fr' ? item.nameFR : item.nameEN}</p>
                  <p className="text-muted text-xs">× {item.quantity}</p>
                </div>
                <span className="text-charcoal">{(item.price * item.quantity).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-beige pt-4 flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-muted">{t('total')}</span>
            <span className="font-serif text-xl text-charcoal">{subtotal.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  )
}
