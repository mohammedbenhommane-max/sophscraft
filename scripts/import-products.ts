import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

type ShopifyRow = {
  Title: string
  'Body (HTML)': string
  Vendor: string
  Type: string
  Tags: string
  Published: string
  'Variant Price': string
  'Image Src': string
  Status: string
  Handle: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapCollection(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('collier') || t.includes('necklace')) return 'colliers'
  if (t.includes('bracelet')) return 'bracelets'
  if (t.includes('boucle') || t.includes('earring')) return 'boucles'
  if (t.includes('bague') || t.includes('ring')) return 'bagues'
  return t || 'autres'
}

async function main() {
  const csvPath = join(process.cwd(), 'data', 'products.csv')
  const content = readFileSync(csvPath, 'utf-8')

  const rows: ShopifyRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Groupe les lignes par Handle (un produit peut avoir plusieurs images)
  const productMap = new Map<string, { row: ShopifyRow; images: string[] }>()

  for (const row of rows) {
    const handle = row.Handle || slugify(row.Title)
    if (!handle) continue

    if (!productMap.has(handle)) {
      productMap.set(handle, { row, images: [] })
    }

    if (row['Image Src']) {
      productMap.get(handle)!.images.push(row['Image Src'])
    }
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const [handle, { row, images }] of productMap) {
    if (!row.Title) {
      skipped++
      continue
    }

    const price = parseFloat(row['Variant Price']) || 0
    const inStock = row.Status?.toLowerCase() === 'active' || row.Published?.toLowerCase() === 'true'

    const data = {
      slug: handle,
      nameFR: row.Title,
      nameEN: row.Title, // À traduire manuellement si besoin
      descriptionFR: row['Body (HTML)'] || '',
      descriptionEN: row['Body (HTML)'] || '',
      price,
      currency: 'EUR',
      images: [...new Set(images)], // déduplique
      collection: mapCollection(row.Type),
      inStock,
      isSoldOut: !inStock,
    }

    const existing = await prisma.product.findUnique({ where: { slug: handle } })

    if (existing) {
      await prisma.product.update({ where: { slug: handle }, data })
      updated++
    } else {
      await prisma.product.create({ data })
      created++
    }
  }

  console.log(`✓ Import terminé : ${created} créés, ${updated} mis à jour, ${skipped} ignorés`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
