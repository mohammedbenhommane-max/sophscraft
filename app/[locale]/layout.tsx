import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

const locales = ['fr', 'en']

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'footer' })
  return { description: t('tagline') }
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
