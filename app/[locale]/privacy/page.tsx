import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — SophsCraft',
}

export default function PrivacyPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">Vos données</p>
        <h1 className="font-serif text-4xl text-charcoal mb-12">Politique de confidentialité</h1>

        <div className="space-y-10 text-sm text-muted leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Données collectées</h2>
            <p>
              Lors d&apos;une commande ou d&apos;un contact, nous collectons : nom, prénom, adresse email,
              adresse de livraison et numéro de téléphone (facultatif). Ces données sont strictement
              nécessaires au traitement de votre commande ou de votre demande.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Utilisation des données</h2>
            <p>Vos données personnelles sont utilisées exclusivement pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Traiter et expédier vos commandes</li>
              <li>Répondre à vos demandes de contact</li>
              <li>Vous envoyer des confirmations de commande</li>
              <li>Vous envoyer notre newsletter (avec votre consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire à l&apos;exécution du contrat,
              augmentée des délais légaux de prescription (5 ans pour les données de commande).
              Les données de newsletter sont conservées jusqu&apos;à désinscription.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Partage des données</h2>
            <p>
              Vos données ne sont jamais vendues ni partagées à des tiers à des fins commerciales.
              Elles peuvent être transmises à nos prestataires techniques (Stripe pour le paiement,
              Resend pour les emails) dans le strict cadre de leurs missions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:contact@sophscraft.com" className="text-gold hover:underline">
                contact@sophscraft.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-charcoal mb-3">Sécurité</h2>
            <p>
              Les paiements sont traités par Stripe, certifié PCI-DSS. Nous ne stockons jamais
              vos données bancaires.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
