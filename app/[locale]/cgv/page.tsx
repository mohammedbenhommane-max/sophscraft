import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — SophsCraft',
}

export default function CGVPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">Transparence</p>
        <h1 className="font-serif text-4xl text-charcoal mb-12">
          Conditions Générales de Vente
        </h1>

        <div className="space-y-10 text-sm text-muted leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 1 — Objet</h2>
            <p>
              Les présentes CGV régissent les ventes de bijoux artisanaux effectuées sur le site
              sophscraft.com entre SophsCraft Jewels (ci-après « le Vendeur ») et tout client
              (ci-après « l&apos;Acheteur »).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 2 — Produits</h2>
            <p>
              Les bijoux proposés sont des créations artisanales faites main. Chaque pièce étant
              unique, de légères variations peuvent exister par rapport aux photos. Ces variations
              font partie du caractère artisanal des créations et ne constituent pas un défaut.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 3 — Prix</h2>
            <p>
              Les prix sont indiqués en euros (€), toutes taxes comprises. Le Vendeur se réserve
              le droit de modifier ses prix à tout moment. Les produits sont facturés au tarif
              en vigueur au moment de la validation de la commande.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 4 — Commande</h2>
            <p>
              La commande est validée après confirmation du paiement. Un email de confirmation
              est envoyé à l&apos;adresse fournie. Le Vendeur se réserve le droit de refuser toute
              commande en cas de problème de stock ou de paiement.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 5 — Paiement</h2>
            <p>
              Le paiement s&apos;effectue en ligne par carte bancaire ou Bancontact via la plateforme
              sécurisée Stripe. Les données bancaires ne sont jamais stockées par le Vendeur.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 6 — Livraison</h2>
            <p>
              Les commandes sont expédiées sous 3 à 5 jours ouvrés. En cas de retard, l&apos;Acheteur
              en sera informé par email. Les frais de livraison sont indiqués lors du passage de
              commande.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 7 — Droit de rétractation</h2>
            <p>
              Conformément à la législation européenne, l&apos;Acheteur dispose d&apos;un délai de 14 jours
              à compter de la réception pour exercer son droit de rétractation, sans justification.
              Les bijoux sur-mesure sont exclus de ce droit conformément à l&apos;article L221-28 du
              Code de la consommation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 8 — Retours</h2>
            <p>
              En cas de rétractation, les produits doivent être retournés dans leur état d&apos;origine
              sous 14 jours. Les frais de retour sont à la charge de l&apos;Acheteur. Le remboursement
              est effectué dans les 14 jours suivant la réception du retour.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 9 — Garantie</h2>
            <p>
              Tous les produits bénéficient de la garantie légale de conformité (2 ans) et de la
              garantie contre les vices cachés. En cas de défaut, contactez-nous à{' '}
              <a href="mailto:contact@sophscraft.com" className="text-gold hover:underline">
                contact@sophscraft.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Article 10 — Litiges</h2>
            <p>
              En cas de litige, une solution amiable sera recherchée en priorité. À défaut,
              les tribunaux compétents seront ceux du lieu du siège du Vendeur.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
