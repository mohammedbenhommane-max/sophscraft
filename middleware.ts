import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // FR sans préfixe, EN avec /en
})

export const config = {
  matcher: ['/((?!api|studio|_next|_vercel|.*\\..*).*)'],
}
