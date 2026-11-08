import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import { staticPageMetadata } from '@/lib/seo'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

const locales = ['fr', 'en']

// Pages pré-générées pour chaque langue, puis servies depuis le cache
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    ...staticPageMetadata(locale, ''),
    ...(locale === 'en' && { title: { absolute: 'SophsCraft — Handmade artisan jewelry', template: '%s | SophsCraft' } }),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* La balise <html> est dans le layout racine, qui ne connaît pas la langue */}
      {locale === 'en' && <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='en'" }} />}
      <CartProvider>
        <Header />
        <CartSidebar />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </NextIntlClientProvider>
  )
}
