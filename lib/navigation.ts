import { createNavigation } from 'next-intl/navigation'

export const { useRouter, usePathname, Link, redirect } = createNavigation({
  locales: ['fr', 'en'] as const,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
})
