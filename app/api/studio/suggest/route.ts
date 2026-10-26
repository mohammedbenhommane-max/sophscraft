import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

// L'analyse d'image peut prendre plusieurs secondes
export const maxDuration = 30

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const MAX_IMAGE_LENGTH = 4_000_000 // data URL d'environ 3 Mo
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

  const { image } = await req.json()
  if (typeof image !== 'string' || !image.startsWith('data:image/') || image.length > MAX_IMAGE_LENGTH) {
    return NextResponse.json({ error: 'Image invalide' }, { status: 400 })
  }

  const [products, collections]: [ProductRow[], CollectionRow[]] = await Promise.all([
    sanityClient.fetch(`*[_type == "product" && defined(price)]{ nameFR, price, "collection": collection->slug.current }`),
    sanityClient.fetch(`*[_type == "collection"]{ "slug": slug.current, nameFR }`),
  ])

  const instructions = `Tu aides SophsCraft, une créatrice belge de bijoux artisanaux faits main, à mettre en ligne un nouveau bijou à partir d'une photo.

Propose :
- un nom court et élégant en français et en anglais, dans le style de la boutique (ex. « Collier Louiza - Élégance en Quartz Rose »), 60 caractères maximum, sans le mot SophsCraft ;
- une description de 2 à 3 phrases en français et en anglais : matières et pierres visibles, style, occasion. N'invente pas de détail invisible sur la photo (taille, poids, type de métal exact) : reste prudent (« teinte dorée », « pierres semi-précieuses ») ;
- la collection la plus adaptée parmi les slugs ci-dessous ;
- un prix en euros cohérent avec les prix actuels de cette collection, et une courte justification.

Collections et prix actuels :
${priceContext(products, collections)}`

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
            { type: 'text', text: 'Voici la photo du nouveau bijou.' },
            { type: 'image_url', image_url: { url: image } },
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
    return NextResponse.json({ error: "L'IA n'a pas pu analyser la photo" }, { status: 502 })
  }

  const data = await res.json()
  const suggestion: ProductSuggestion = JSON.parse(data.choices[0].message.content)
  return NextResponse.json(suggestion)
}
