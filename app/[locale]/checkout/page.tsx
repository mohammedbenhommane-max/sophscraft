import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Checkout' }
}

export default async function CheckoutPage() {
  const t = await getTranslations('checkout')

  return (
    <div className="pt-16 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl text-charcoal mb-12">{t('title')}</h1>
        <CheckoutForm />
      </div>
    </div>
  )
}
