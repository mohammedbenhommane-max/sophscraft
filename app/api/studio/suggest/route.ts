import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// L'analyse d'image peut prendre plusieurs secondes
export const maxDuration = 30

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const MAX_IMAGES = 4
const MAX_IMAGES_LENGTH = 4_000_000 // total des data URL, sous la limite de 4,5 Mo de Vercel
const MAX_INSTRUCTION_LENGTH = 500
const ALLOWED_ROLES = ['administrator', 'editor']

type ProductRow = { nameFR: string; price: number; collection: string | null }
type CollectionRow = { slug: string; nameFR: string }

export type ProductSuggestion = {
  nameFR: string
  nameEN: string
  descriptionFR: string
  descriptionEN: string
  collectionSlug: string
  price: number
  priceReason: string
}

type SuggestBody = {
  images?: unknown
  // Fiche actuelle + demande de modification (ex. « description plus courte »)
  current?: Partial<ProductSuggestion>
  instruction?: unknown
}

// Seuls les membres du projet Sanity connectés au Studio peuvent utiliser l'IA
async function isStudioEditor(authHeader: string | null) {
  const token = authHeader?.replace(/^Bearer /, '')
  if (!token) return false
  const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-01-01/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return false
  const user = await res.json()
  const roles: string[] = [user?.role, ...(user?.roles ?? []).map((r: { name: string }) => r.name)]
  return Boolean(user?.id) && roles.some((role) => ALLOWED_ROLES.includes(role))
}

// Prix actuels par collection, pour que la proposition reste cohérente avec la boutique
function priceContext(products: ProductRow[], collections: CollectionRow[]) {
  return collections
    .map((c) => {
      const items = products.filter((p) => p.collection === c.slug)
      if (!items.length) return `- ${c.slug} (${c.nameFR}) : aucun produit`
      const prices = items.map((p) => p.price).sort((a, b) => a - b)
      const median = prices[Math.floor(prices.length / 2)]
      const examples = items.slice(0, 4).map((p) => `« ${p.nameFR} » ${p.price} €`).join(', ')
      return `- ${c.slug} (${c.nameFR}) : ${items.length} produits, prix de ${prices[0]} € à ${prices[prices.length - 1]} €, médiane ${median} €. Exemples : ${examples}`
    })
    .join('\n')
}

export async function POST(req: NextRequest) {
  if (!(await isStudioEditor(req.headers.get('authorization')))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY manquant dans Vercel' }, { status: 500 })
  }

  const { images, current, instruction }: SuggestBody = await req.json()
  const validImages =
    Array.isArray(images) &&
    images.length >= 1 &&
    images.length <= MAX_IMAGES &&
    images.every((img) => typeof img === 'string' && img.startsWith('data:image/')) &&
    images.join('').length <= MAX_IMAGES_LENGTH
  if (!validImages) {
    return NextResponse.json({ error: `Entre 1 et ${MAX_IMAGES} photos (JPEG ou PNG)` }, { status: 400 })
  }
  const request = typeof instruction === 'string' ? instruction.trim().slice(0, MAX_INSTRUCTION_LENGTH) : ''

  const [products, collections]: [ProductRow[], CollectionRow[]] = await Promise.all([
    sanityClient.fetch(`*[_type == "product" && defined(price)]{ nameFR, price, "collection": collection->slug.current }`),
    sanityClient.fetch(`*[_type == "collection"]{ "slug": slug.current, nameFR }`),
  ])

  const instructions = `Tu aides SophsCraft, une créatrice belge de bijoux artisanaux faits main, à mettre en ligne un nouveau bijou à partir de photos (plusieurs angles du même bijou).

Propose :
- un nom court et élégant en français et en anglais, dans le style de la boutique (ex. « Collier Louiza - Élégance en Quartz Rose »), 60 caractères maximum, sans le mot SophsCraft ;
- une description de 2 à 3 phrases en français et en anglais : matières et pierres visibles, style, occasion. N'invente pas de détail invisible sur les photos (taille, poids, type de métal exact) : reste prudent (« teinte dorée », « pierres semi-précieuses ») ;
- la collection la plus adaptée parmi les slugs ci-dessous ;
- un prix en euros cohérent avec les prix actuels de cette collection, et une courte justification.

Si une fiche actuelle et une demande de modification sont fournies, applique la demande à la fiche actuelle : ne change que ce qui est demandé (ou ce qui en découle, ex. la traduction anglaise d'un texte français modifié) et garde le reste à l'identique. Les informations données par la créatrice (matière, pierre, prix…) priment sur ce que tu vois.

Collections et prix actuels :
${priceContext(products, collections)}`

  const userText =
    current && request
      ? `Fiche actuelle :\n${JSON.stringify(current, null, 2)}\n\nDemande de modification : ${request}`
      : request
        ? `Photos du nouveau bijou. Précision de la créatrice : ${request}`
        : 'Photos du nouveau bijou.'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: instructions },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            ...(images as string[]).map((url) => ({ type: 'image_url', image_url: { url } })),
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'product_suggestion',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['nameFR', 'nameEN', 'descriptionFR', 'descriptionEN', 'collectionSlug', 'price', 'priceReason'],
            properties: {
              nameFR: { type: 'string' },
              nameEN: { type: 'string' },
              descriptionFR: { type: 'string' },
              descriptionEN: { type: 'string' },
              collectionSlug: { type: 'string', enum: collections.map((c) => c.slug) },
              price: { type: 'number' },
              priceReason: { type: 'string' },
            },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    console.error('[studio/suggest] OpenAI error:', res.status, await res.text())
    return NextResponse.json({ error: "L'IA n'a pas pu analyser les photos" }, { status: 502 })
  }

  const data = await res.json()
  const suggestion: ProductSuggestion = JSON.parse(data.choices[0].message.content)
  return NextResponse.json(suggestion)
}
