import { notFound } from 'next/navigation'

// Toute URL inconnue passe par la page 404 traduite de app/[locale]/not-found.tsx
export default function CatchAllPage() {
  notFound()
}
