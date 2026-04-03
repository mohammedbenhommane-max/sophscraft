import { createClient } from '@sanity/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'

// Charge .env.local si les variables ne sont pas déjà définies
;(function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local absent — les variables doivent être définies dans l'environnement
  }
})()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

type ShopifyRow = {
  Handle: string
  Title: string
  'Body (HTML)': string
  Vendor: string
  'Product Category': string
  Type: string
  Tags: string
  Published: string
  'Variant Price': string
  'Image Src': string
  Status: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Handles both "Product Category" (e.g. "Apparel & Accessories > Jewelry > Bracelets")
// and "Type" (e.g. "Bracelets", "Necklaces", "Earrings")
function mapCollection(productCategory: string, type: string): string {
  const combined = `${productCategory} ${type}`.toLowerCase()
  if (combined.includes('bracelet')) return 'bracelets'
  if (combined.includes('necklace') || combined.includes('collier')) return 'colliers'
  if (combined.includes('earring') || combined.includes('boucle')) return 'boucles-doreilles'
  if (combined.includes('ring') || combined.includes('bague')) return 'bagues'
  if (combined.includes('anklet') || combined.includes('cheville')) return 'chevilles'
  return slugify(type) || 'autres'
}

const COLLECTION_LABELS: Record<string, string> = {
  bracelets: 'Bracelets',
  colliers: 'Colliers',
  'boucles-doreilles': "Boucles d'oreilles",
  bagues: 'Bagues',
  chevilles: 'Chevilles',
  autres: 'Autres',
}

const SKIP_HANDLES = new Set([
  'gift-card',
  'rendez-vous-pour-conception-et-personnalisation-de-bijoux',
])

function isCorruptedHTML(html: string): boolean {
  return html.includes('data-testid="conversation-turn"')
}

/** Upload une image depuis une URL vers Sanity Assets. Retourne l'asset _id. */
async function uploadImage(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = imageUrl.split('/').pop()?.split('?')[0] ?? 'image.jpg'
    const asset = await client.assets.upload('image', buffer, { filename })
    return asset._id
  } catch (err) {
    console.warn(`  ⚠ Impossible d'uploader ${imageUrl}: ${err}`)
    return null
  }
}

/** S'assure qu'une collection existe dans Sanity, la crée si besoin. Retourne l'_id. */
const collectionCache: Record<string, string> = {}

async function ensureCollection(slug: string, nameFR: string): Promise<string> {
  if (collectionCache[slug]) return collectionCache[slug]

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "collection" && slug.current == $slug][0]{ _id }`,
    { slug }
  )

  if (existing) {
    collectionCache[slug] = existing._id
    return existing._id
  }

  const EN_LABELS: Record<string, string> = {
    bracelets: 'Bracelets',
    colliers: 'Necklaces',
    'boucles-doreilles': 'Earrings',
    bagues: 'Rings',
    chevilles: 'Anklets',
    autres: 'Other',
  }

  const doc = await client.create({
    _type: 'collection',
    nameFR,
    nameEN: EN_LABELS[slug] ?? nameFR,
    slug: { _type: 'slug', current: slug },
    order: 0,
  })

  collectionCache[slug] = doc._id
  console.log(`  + Collection créée : ${nameFR} (${slug})`)
  return doc._id
}

let _keyCounter = 0
function key(): string {
  return (++_keyCounter).toString(36) + Math.random().toString(36).slice(2, 6)
}

/**
 * Convertit du HTML Shopify en blocs Portable Text valides.
 * Un paragraphe HTML → un bloc. Les balises inline sont ignorées (texte brut conservé).
 */
function htmlToBlocks(html: string): object[] {
  if (!html || isCorruptedHTML(html)) return []

  // Extrait les paragraphes : <p>...</p>, <li>...</li>, ou texte hors balises de bloc
  const blockPattern = /<(?:p|li|h[1-6]|div)[^>]*>([\s\S]*?)<\/(?:p|li|h[1-6]|div)>/gi
  const blocks: object[] = []
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = blockPattern.exec(html)) !== null) {
    const inner = match[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')  // strip remaining inline tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8203;/g, '')
      .trim()

    if (!inner) continue

    blocks.push({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text: inner, marks: [] }],
    })
  }

  // Fallback si aucun bloc trouvé (HTML sans balises de bloc)
  if (blocks.length === 0) {
    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    if (!text) return []
    blocks.push({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text, marks: [] }],
    })
  }

  return blocks
}

async function main() {
  // Usage : npm run import:sanity -- bracelet-style-rolex glamour
  const filterHandles = process.argv.slice(2)
  if (filterHandles.length > 0) {
    console.log(`\n→ Mode test : ${filterHandles.join(', ')}\n`)
  }

  const csvPath = join(process.cwd(), 'data', 'products-clean.csv')
  const content = readFileSync(csvPath, 'utf-8')

  const rows: ShopifyRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Groupe les lignes par Handle (un produit = plusieurs lignes pour les images/variantes)
  const productMap = new Map<string, { row: ShopifyRow; imageUrls: string[] }>()

  for (const row of rows) {
    const handle = row.Handle || slugify(row.Title)

    // Skip rows with no handle or title (continuation image rows without a handle are grouped below)
    if (!handle) continue

    // Skip unwanted handles
    if (SKIP_HANDLES.has(handle)) continue

    // Skip draft products
    if (row.Status?.toLowerCase() === 'draft') continue

    // Only set the main row data on the first occurrence (has Title)
    if (!productMap.has(handle)) {
      if (!row.Title) continue // first row must have a title
      productMap.set(handle, { row, imageUrls: [] })
    }

    if (row['Image Src']) {
      productMap.get(handle)!.imageUrls.push(row['Image Src'])
    }
  }

  // Filtre si handles passés en argument
  if (filterHandles.length > 0) {
    for (const h of Array.from(productMap.keys())) {
      if (!filterHandles.includes(h)) productMap.delete(h)
    }
  }

  console.log(`\n→ ${productMap.size} produits à importer\n`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const [slug, { row, imageUrls }] of Array.from(productMap.entries())) {
    console.log(`· ${row.Title}`)

    const price = parseFloat(row['Variant Price']) || 0
    const inStock = row.Status?.toLowerCase() === 'active'
    const collectionSlug = mapCollection(row['Product Category'] ?? '', row.Type ?? '')

    // Prépare la collection
    const collectionLabel = COLLECTION_LABELS[collectionSlug] ?? (collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1))
    const collectionId = await ensureCollection(collectionSlug, collectionLabel)

    // Upload images (dédupliquées)
    const uniqueUrls = Array.from(new Set(imageUrls))
    const imageAssets: { _type: 'image'; asset: { _type: 'reference'; _ref: string } }[] = []

    for (const url of uniqueUrls) {
      const assetId = await uploadImage(url)
      if (assetId) {
        imageAssets.push({ _type: 'image', asset: { _type: 'reference', _ref: assetId } })
      }
    }

    const doc = {
      _type: 'product',
      nameFR: row.Title,
      nameEN: row.Title,
      slug: { _type: 'slug', current: slug },
      descriptionFR: htmlToBlocks(row['Body (HTML)']),
      descriptionEN: [],
      price,
      images: imageAssets,
      collection: { _type: 'reference', _ref: collectionId },
      inStock,
      isSoldOut: !inStock,
      isCustom: false,
    }

    // Upsert par slug
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "product" && slug.current == $slug][0]{ _id }`,
      { slug }
    )

    if (existing) {
      await client.patch(existing._id).set(doc).commit()
      updated++
      console.log(`  ✓ mis à jour`)
    } else {
      await client.create(doc)
      created++
      console.log(`  ✓ créé`)
    }
  }

  console.log(`\n✅ Import terminé : ${created} créés, ${updated} mis à jour, ${skipped} ignorés\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
