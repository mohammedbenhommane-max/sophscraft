import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import { staticPageMetadata } from '@/lib/seo'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

const locales = ['fr', 'en']

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...staticPageMetadata(locale, ''),
    ...(locale === 'en' && { title: { absolute: 'SophsCraft — Handmade artisan jewelry', template: '%s | SophsCraft' } }),
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
