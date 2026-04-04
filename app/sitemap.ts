import type { MetadataRoute } from 'next'
import { getAllProducts, getAllBlogPosts, getAllCollections } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, collections] = await Promise.all([
    getAllProducts(),
    getAllBlogPosts(),
    getAllCollections(),
  ])

  const staticPages = [
    '',
    '/collections',
    '/blog',
    '/sur-mesure',
    '/rendez-vous',
    '/contact',
    '/legal',
    '/privacy',
    '/cgv',
  ].flatMap((path) => [
    {
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      priority: path === '' ? 1 : 0.8,
      alternates: { languages: { fr: `${BASE_URL}${path}`, en: `${BASE_URL}/en${path}` } },
    },
    {
      url: `${BASE_URL}/en${path}`,
      lastModified: new Date(),
      priority: path === '' ? 1 : 0.8,
      alternates: { languages: { fr: `${BASE_URL}${path}`, en: `${BASE_URL}/en${path}` } },
    },
  ])

  const productPages = products.flatMap((p) => {
    const images = p.images?.map((img) => urlFor(img).width(800).url()) ?? []
    return [
      {
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: new Date(),
        priority: 0.9,
        alternates: { languages: { fr: `${BASE_URL}/products/${p.slug}`, en: `${BASE_URL}/en/products/${p.slug}` } },
        ...(images.length > 0 && { images }),
      },
      {
        url: `${BASE_URL}/en/products/${p.slug}`,
        lastModified: new Date(),
        priority: 0.9,
        alternates: { languages: { fr: `${BASE_URL}/products/${p.slug}`, en: `${BASE_URL}/en/products/${p.slug}` } },
        ...(images.length > 0 && { images }),
      },
    ]
  })

  const collectionPages = collections.flatMap((c) => [
    {
      url: `${BASE_URL}/collections/${c.slug}`,
      lastModified: new Date(),
      priority: 0.8,
      alternates: { languages: { fr: `${BASE_URL}/collections/${c.slug}`, en: `${BASE_URL}/en/collections/${c.slug}` } },
    },
    {
      url: `${BASE_URL}/en/collections/${c.slug}`,
      lastModified: new Date(),
      priority: 0.8,
      alternates: { languages: { fr: `${BASE_URL}/collections/${c.slug}`, en: `${BASE_URL}/en/collections/${c.slug}` } },
    },
  ])

  const blogPages = posts.flatMap((p) => [
    {
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      priority: 0.7,
      alternates: { languages: { fr: `${BASE_URL}/blog/${p.slug}`, en: `${BASE_URL}/en/blog/${p.slug}` } },
    },
    {
      url: `${BASE_URL}/en/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      priority: 0.7,
      alternates: { languages: { fr: `${BASE_URL}/blog/${p.slug}`, en: `${BASE_URL}/en/blog/${p.slug}` } },
    },
  ])

  return [...staticPages, ...productPages, ...collectionPages, ...blogPages]
}
