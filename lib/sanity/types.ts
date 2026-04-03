export type SanityImage = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; width: number; height: number }
}

export type SanityCollection = {
  _id: string
  slug: string
  nameFR: string
  nameEN: string
  description?: string
  image?: SanityImage
  order?: number
}

export type SanityProductVariant = {
  size: string
  available: boolean
}

export type SanityProduct = {
  _id: string
  slug: string
  nameFR: string
  nameEN: string
  descriptionFR?: any[]  // Portable Text blocks
  descriptionEN?: any[]  // Portable Text blocks
  price: number
  images?: SanityImage[]
  isSoldOut: boolean
  inStock: boolean
  isCustom: boolean
  variants?: SanityProductVariant[]
  collection?: {
    slug: string
    nameFR: string
    nameEN: string
  }
}

export type SanityBlogPost = {
  _id: string
  slug: string
  titleFR: string
  titleEN: string
  category: 'events' | 'inspirations' | 'presse'
  coverImage?: SanityImage
  bodyFR?: any[]
  bodyEN?: any[]
  publishedAt?: string
}

// Shape attendue par ProductCard (images déjà résolues en strings)
export type ProductCardData = {
  id: string
  slug: string
  nameFR: string
  nameEN: string
  price: number
  images: string[]
  isSoldOut: boolean
}
