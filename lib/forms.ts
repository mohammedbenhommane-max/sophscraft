// Outils partagés par les routes de formulaires (contact, sur-mesure, newsletter)

const MIN_FILL_MS = 3000
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

// Champs anti-robot envoyés par les formulaires :
// - `website` est invisible pour un humain et doit rester vide
// - `startedAt` est l'heure d'affichage du formulaire (un humain met plus de 3 s à le remplir)
export function isBot(body: { website?: unknown; startedAt?: unknown }) {
  if (body.website) return true
  const startedAt = Number(body.startedAt)
  return !startedAt || Date.now() - startedAt < MIN_FILL_MS
}

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 200 && EMAIL_RE.test(value)
}

// Texte saisi par un visiteur, prêt à être inséré dans un email HTML
export function escapeHtml(value: unknown, maxLength = 5000) {
  return String(value ?? '')
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Pour un sujet d'email : une seule ligne, longueur limitée
export function oneLine(value: unknown, maxLength = 120) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}
