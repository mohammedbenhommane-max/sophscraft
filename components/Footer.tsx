import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SOCIAL_LINKS } from '@/lib/social'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-charcoal text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-cream mb-3">SophsCraft</h3>
            <p className="text-sm text-cream/60 leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">{t('navigation')}</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              {['collections', 'sur-mesure', 'rendez-vous', 'blog', 'contact'].map((path) => (
                <li key={path}>
                  <Link href={`/${path}`} className="hover:text-gold transition-colors capitalize">
                    {path.replace('-', ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal + Réseaux */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">{t('legalHeading')}</h4>
            <ul className="space-y-2 text-sm text-cream/70 mb-6">
              <li><Link href="/legal" className="hover:text-gold transition-colors">{t('legal')}</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/cgv" className="hover:text-gold transition-colors">{t('terms')}</Link></li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="flex gap-4">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream/10 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} SophsCraft — {t('rights')}
        </div>
      </div>
    </footer>
  )
}
