import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — SophsCraft',
}

export default function LegalPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">Transparence</p>
        <h1 className="font-serif text-4xl text-charcoal mb-12">Mentions légales</h1>

        <div className="prose prose-sm max-w-none text-muted space-y-10">
          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Éditeur du site</h2>
            <p>
              <strong>SophsCraft Jewels</strong><br />
              Bijouterie artisanale<br />
              Email : <a href="mailto:contact@sophscraft.com" className="text-gold hover:underline">contact@sophscraft.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Hébergement</h2>
            <p>
              Ce site est hébergé par <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, images, visuels, logos) sont
              la propriété exclusive de SophsCraft Jewels et sont protégés par les lois relatives
              à la propriété intellectuelle. Toute reproduction, même partielle, est interdite
              sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Cookies</h2>
            <p>
              Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement
              (panier, préférences de langue). Aucun cookie publicitaire ou de traçage n&apos;est
              utilisé.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Contact</h2>
            <p>
              Pour toute question relative au site, contactez-nous à{' '}
              <a href="mailto:contact@sophscraft.com" className="text-gold hover:underline">
                contact@sophscraft.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
