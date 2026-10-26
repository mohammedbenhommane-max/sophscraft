import { sanityClient } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/image'
import { cleanProductName, portableTextToPlain } from '@/lib/seo'
import { SHIPPING_COUNTRIES, SHIPPING_PRICE } from '@/lib/shop'

// Flux produits pour Google Merchant Center (fiches gratuites Google Shopping).
// Google le relit chaque jour ; la version servie est régénérée au plus toutes les heures.
export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'

// Catégories Google : https://www.google.com/basepages/producttype/taxonomy-with-ids.fr-FR.txt
const GOOGLE_CATEGORIES: Record<string, string> = {
  colliers: '196', // Vêtements et accessoires > Bijoux > Colliers
  bracelets: '191', // … > Bijoux > Bracelets
  bagues: '200', // … > Bijoux > Bagues
  'boucles-doreilles': '194', // … > Bijoux > Boucles d'oreilles
}
const JEWELRY_CATEGORY = '188' // … > Bijoux

type FeedProduct = {
  _id: string
  slug: string
  nameFR: string
  descriptionFR?: { children?: { text?: string }[] }[]
  price: number
  images?: { asset?: unknown }[]
  isSoldOut?: boolean
  collection?: { slug: string; nameFR: string }
}

const xml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function item(product: FeedProduct) {
  const title = cleanProductName(product.nameFR).slice(0, 150)
  const description = (portableTextToPlain(product.descriptionFR) || title).slice(0, 5000)
  const [main, ...others] = (product.images ?? []).map((img) => urlFor(img).width(1200).url())
  const category = GOOGLE_CATEGORIES[product.collection?.slug ?? ''] ?? JEWELRY_CATEGORY
  const shipping = SHIPPING_COUNTRIES.map(
    (country) =>
      `<g:shipping><g:country>${country}</g:country><g:price>${SHIPPING_PRICE.toFixed(2)} EUR</g:price></g:shipping>`
  ).join('')

  return `
    <item>
      <g:id>${xml(product._id)}</g:id>
      <g:title>${xml(title)}</g:title>
      <g:description>${xml(description)}</g:description>
      <g:link>${xml(`${BASE_URL}/products/${product.slug}`)}</g:link>
      <g:image_link>${xml(main)}</g:image_link>
      ${others.slice(0, 10).map((url) => `<g:additional_image_link>${xml(url)}</g:additional_image_link>`).join('')}
      <g:availability>${product.isSoldOut ? 'out_of_stock' : 'in_stock'}</g:availability>
      <g:price>${product.price.toFixed(2)} EUR</g:price>
      <g:brand>SophsCraft</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${category}</g:google_product_category>
      ${product.collection ? `<g:product_type>${xml(product.collection.nameFR)}</g:product_type>` : ''}
      <g:age_group>adult</g:age_group>
      <g:gender>female</g:gender>
      ${shipping}
    </item>`
}

export async function GET() {
  // Produits publiés, avec prix et photo ; les pièces sur-mesure (sur devis) sont exclues
  const products: FeedProduct[] = await sanityClient.fetch(`
    *[_type == "product" && defined(price) && price > 0 && count(images) > 0 && isCustom != true && defined(slug.current)]
    | order(_createdAt desc) {
      _id, "slug": slug.current, nameFR, descriptionFR, price, images, isSoldOut,
      "collection": collection->{ "slug": slug.current, nameFR }
    }
  `)

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SophsCraft — Bijoux artisanaux faits main</title>
    <link>${BASE_URL}</link>
    <description>Catalogue SophsCraft</description>${products.map(item).join('')}
  </channel>
</rss>`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
