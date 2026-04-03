/**
 * Page serveur — exporte uniquement les métadonnées.
 * Le Studio lui-même est rendu dans Studio.tsx (client component)
 * pour éviter que sanity.config.ts soit évalué côté RSC.
 */
export { metadata, viewport } from 'next-sanity/studio'

import Studio from './Studio'

export default function StudioPage() {
  return <Studio />
}
