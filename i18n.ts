import { getRequestConfig } from 'next-intl/server'

const locales = ['fr', 'en']

// Next 15 : la langue arrive de façon asynchrone (`requestLocale`) au lieu de `locale`
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = requested && locales.includes(requested) ? requested : 'fr'
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
