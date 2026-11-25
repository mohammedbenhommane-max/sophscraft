// Redimensionne les images directement chez Sanity et Unsplash, qui le font gratuitement,
// au lieu de l'optimisation d'images Vercel (quota mensuel limité).
type LoaderParams = { src: string; width: number; quality?: number }

export default function imageLoader({ src, width, quality }: LoaderParams) {
  if (!src.startsWith('https://cdn.sanity.io/') && !src.startsWith('https://images.unsplash.com/')) {
    // Logos locaux et anciennes images : servis tels quels
    return src
  }
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  if (src.startsWith('https://cdn.sanity.io/')) url.searchParams.set('fit', 'max')
  return url.toString()
}
