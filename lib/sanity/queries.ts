import { sanityClient } from './client'
import type { SanityProduct, SanityCollection, SanityBlogPost } from './types'

// Champs communs aux listes de produits
const PRODUCT_FIELDS = `
  _id,
  "slug": slug.current,
  nameFR,
  nameEN,
  price,
  images,
  isSoldOut,
  inStock,
  isCustom,
  "collection": collection->{ "slug": slug.current, nameFR, nameEN }
`

// Champs supplémentaires pour la page détail
const PRODUCT_DETAIL_FIELDS = `
  ${PRODUCT_FIELDS},
  descriptionFR,
  descriptionEN,
  variants
`

const COLLECTION_FIELDS = `
  _id,
  "slug": slug.current,
  nameFR,
  nameEN,
  description,
  image,
  order
`

const BLOG_FIELDS = `
  _id,
  "slug": slug.current,
  titleFR,
  titleEN,
  category,
  coverImage,
  publishedAt
`

// ─── Produits ───────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<SanityProduct[]> {
  return sanityClient.fetch(
    `*[_type == "product"] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    {},
    { next: { tags: ['product'] } }
  )
}

export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_DETAIL_FIELDS} }`,
    { slug },
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' }
      : { next: { tags: [`product:${slug}`] } }
  )
}

export async function getProductsByCollection(collectionSlug: string): Promise<SanityProduct[]> {
  return sanityClient.fetch(
    `*[_type == "product" && collection->slug.current == $collectionSlug] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    { collectionSlug },
    { next: { tags: [`collection:${collectionSlug}`] } }
  )
}

// ─── Collections ────────────────────────────────────────────────────────────

export async function getAllCollections(): Promise<SanityCollection[]> {
  return sanityClient.fetch(
    `*[_type == "collection"] | order(order asc) { ${COLLECTION_FIELDS} }`,
    {},
    { next: { tags: ['collection'] } }
  )
}

export async function getCollectionBySlug(slug: string): Promise<SanityCollection | null> {
  return sanityClient.fetch(
    `*[_type == "collection" && slug.current == $slug][0] { ${COLLECTION_FIELDS} }`,
    { slug },
    { next: { tags: [`collection:${slug}`] } }
  )
}

// ─── Blog ────────────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<SanityBlogPost[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) { ${BLOG_FIELDS} }`,
    {},
    { next: { tags: ['blogPost'] } }
  )
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      ${BLOG_FIELDS},
      bodyFR,
      bodyEN
    }`,
    { slug },
    { next: { tags: [`blogPost:${slug}`] } }
  )
}

export async function getBlogPostsByCategory(category: string): Promise<SanityBlogPost[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && category == $category] | order(publishedAt desc) { ${BLOG_FIELDS} }`,
    { category },
    { next: { tags: ['blogPost'] } }
  )
}
