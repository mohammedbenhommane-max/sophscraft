import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  }
}

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

// Règles de réaffectation basées sur le nom FR du produit
// Règles spécifiques par nom exact (priorité sur les patterns)
const EXACT_RULES: Record<string, string> = {
  'Titanic': 'colliers',
  'Vintage Azure Heart Pendant Necklace': 'colliers',
  'Symphony of Love': 'bagues',
  'RAJA': 'bagues',
  'fleur de lys': 'bagues',
  'Fleur-de-Lys': 'bagues',
  'Charme - Élégance et Sophistication': 'colliers',
  'Rainbow': 'boucles-doreilles',
  'Rosée de Toulouse': 'colliers',
  'The Vibrant multicolores tourmaline Bead Star Necklace': 'colliers',
  'Gemstone Symphony: The Mixed tourmaline Bead Necklace': 'colliers',
  'Mint Elegance': 'colliers',
  'Midnight Drop Necklace': 'colliers',
  'Flora': 'colliers',
  'Spectrum Splendor': 'colliers',
}

const RULES: { patterns: RegExp[]; collectionSlug: string }[] = [
  {
    patterns: [/collier/i, /sautoir/i, /pendentif/i, /chaîne/i, /chaine/i, /necklace/i, /pendant/i],
    collectionSlug: 'colliers',
  },
  {
    patterns: [/bracelet/i, /jonc/i],
    collectionSlug: 'bracelets',
  },
  {
    patterns: [/boucle/i, /earring/i, /créole/i, /creole/i],
    collectionSlug: 'boucles-doreilles',
  },
  {
    patterns: [/bague/i, /anneau/i, /ring/i],
    collectionSlug: 'bagues',
  },
]

async function main() {
  // Récupérer tous les produits avec leur collection actuelle
  const products = await client.fetch(`
    *[_type == "product"] {
      _id,
      nameFR,
      nameEN,
      "collectionSlug": collection->slug.current
    }
  `)

  // Récupérer les IDs des collections cibles
  const collections = await client.fetch(`
    *[_type == "collection"] {
      _id,
      "slug": slug.current
    }
  `)

  const collectionMap: Record<string, string> = {}
  for (const col of collections) {
    collectionMap[col.slug] = col._id
  }

  console.log(`\n📦 Collections disponibles: ${Object.keys(collectionMap).join(', ')}`)
  console.log(`\n🔍 Analyse de ${products.length} produits...\n`)

  let updated = 0
  let skipped = 0
  let unmatched: string[] = []

  for (const product of products) {
    const name = product.nameFR || product.nameEN || ''

    // Trouver la collection correspondante
    let targetSlug: string | null = EXACT_RULES[name] ?? null

    if (!targetSlug) {
      for (const rule of RULES) {
        if (rule.patterns.some((p) => p.test(name))) {
          targetSlug = rule.collectionSlug
          break
        }
      }
    }

    if (!targetSlug) {
      unmatched.push(`  ❓ "${name}" (collection actuelle: ${product.collectionSlug})`)
      continue
    }

    const targetId = collectionMap[targetSlug]
    if (!targetId) {
      console.log(`  ⚠️  Collection "${targetSlug}" introuvable dans Sanity`)
      continue
    }

    // Ne pas modifier si déjà dans la bonne collection
    if (product.collectionSlug === targetSlug) {
      skipped++
      continue
    }

    console.log(`  ✏️  "${name}" → ${targetSlug} (était: ${product.collectionSlug})`)

    await client.patch(product._id).set({
      collection: { _type: 'reference', _ref: targetId },
    }).commit()

    updated++
  }

  console.log(`\n✅ ${updated} produits réaffectés`)
  console.log(`⏭️  ${skipped} produits déjà dans la bonne collection`)

  if (unmatched.length > 0) {
    console.log(`\n❓ ${unmatched.length} produits sans correspondance (à faire manuellement):`)
    unmatched.forEach((m) => console.log(m))
  }
}

main().catch(console.error)
