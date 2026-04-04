import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

const locales = ['fr', 'en']
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  const canonical = locale === 'fr' ? BASE_URL : `${BASE_URL}/en`
  return {
    description: t('tagline'),
    alternates: {
      canonical,
      languages: { fr: BASE_URL, en: `${BASE_URL}/en` },
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CartProvider>
        <Header />
        <CartSidebar />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </NextIntlClientProvider>
  )
}
