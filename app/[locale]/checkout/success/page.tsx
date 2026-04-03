import Link from 'next/link'
import ClearCart from './ClearCart'

export default async function SuccessPage() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-cream">
      <ClearCart />
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-charcoal mb-4">Merci pour votre commande</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          Vous recevrez un email de confirmation sous peu. Chaque pièce est préparée avec soin.
        </p>
        <Link
          href="/collections"
          className="inline-block border border-charcoal text-charcoal px-8 py-3 text-xs uppercase tracking-widest hover:bg-charcoal hover:text-cream transition-all duration-300"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}
