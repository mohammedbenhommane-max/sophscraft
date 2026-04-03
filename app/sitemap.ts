import type { MetadataRoute } from 'next'
import { getAllProducts, getAllBlogPosts, getAllCollections } from '@/lib/sanity/queries'

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
    { url: `${BASE_URL}${path}`, lastModified: new Date(), priority: path === '' ? 1 : 0.8 },
    { url: `${BASE_URL}/en${path}`, lastModified: new Date(), priority: path === '' ? 1 : 0.8 },
  ])

  const productPages = products.flatMap((p) => [
    { url: `${BASE_URL}/products/${p.slug}`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE_URL}/en/products/${p.slug}`, lastModified: new Date(), priority: 0.9 },
  ])

  const collectionPages = collections.flatMap((c) => [
    { url: `${BASE_URL}/collections/${c.slug}`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE_URL}/en/collections/${c.slug}`, lastModified: new Date(), priority: 0.8 },
  ])

  const blogPages = posts.flatMap((p) => [
    { url: `${BASE_URL}/blog/${p.slug}`, lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(), priority: 0.7 },
    { url: `${BASE_URL}/en/blog/${p.slug}`, lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(), priority: 0.7 },
  ])

  return [...staticPages, ...productPages, ...collectionPages, ...blogPages]
}
