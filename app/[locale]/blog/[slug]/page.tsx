import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PortableText } from '@portabletext/react'
import { getBlogPostBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

type Props = { params: { slug: string; locale: string } }

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Article introuvable' }
  const title = params.locale === 'en' ? post.titleEN : post.titleFR
  const description =
    params.locale === 'en'
      ? `Read "${title}" on the SophsCraft blog — handmade jewelry inspirations, events and press.`
      : `Lire "${title}" sur le blog SophsCraft — inspirations bijoux, événements et presse.`
  const imageUrl = post.coverImage ? urlFor(post.coverImage).width(1200).url() : undefined
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sophscraft.com'
  const frUrl = `${base}/blog/${params.slug}`
  const enUrl = `${base}/en/blog/${params.slug}`
  return {
    title,
    description,
    alternates: {
      canonical: params.locale === 'fr' ? frUrl : enUrl,
      languages: { fr: frUrl, en: enUrl },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: title }] }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = params
  const [post, t] = await Promise.all([getBlogPostBySlug(slug), getTranslations('blog')])
  if (!post) notFound()

  const title = locale === 'en' ? post.titleEN : post.titleFR
  const body = locale === 'en' ? post.bodyEN : post.bodyFR
  const validCategories = ['events', 'inspirations', 'presse'] as const
  type CatKey = typeof validCategories[number]
  const categoryLabel = post.category
    ? (validCategories.includes(post.category as CatKey)
        ? t(`categories.${post.category as CatKey}`)
        : post.category)
    : null

  const coverImageUrl = post.coverImage ? urlFor(post.coverImage).width(1200).url() : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    ...(coverImageUrl && { image: coverImageUrl }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
    author: { '@type': 'Organization', name: 'SophsCraft' },
    publisher: {
      '@type': 'Organization',
      name: 'SophsCraft',
      logo: { '@type': 'ImageObject', url: 'https://sophscraft.com/images/logo.png' },
    },
  }

  return (
    <div className="pt-16 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {post.coverImage && (
        <div className="relative h-[50vh] w-full overflow-hidden bg-beige">
          <Image
            src={urlFor(post.coverImage).width(1400).url()}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-charcoal/30" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-16">
        <nav className="mb-8 text-xs text-muted uppercase tracking-widest flex gap-2 items-center">
          <Link href="/blog" className="hover:text-gold transition-colors">{t('title')}</Link>
          <span>/</span>
          {categoryLabel && (
            <>
              <span className="text-gold">{categoryLabel}</span>
              <span>/</span>
            </>
          )}
          <span className="text-charcoal truncate max-w-[200px]">{title}</span>
        </nav>

        <header className="mb-12">
          {categoryLabel && (
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{categoryLabel}</p>
          )}
          <h1 className="font-serif text-4xl lg:text-5xl text-charcoal leading-tight mb-4">
            {title}
          </h1>
          {post.publishedAt && (
            <p className="text-muted text-sm">{formatDate(post.publishedAt, locale)}</p>
          )}
        </header>

        {body && body.length > 0 ? (
          <div className="prose prose-lg max-w-none text-charcoal
            prose-headings:font-serif prose-headings:text-charcoal
            prose-p:text-muted prose-p:leading-relaxed
            prose-a:text-gold prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-sm prose-img:w-full">
            <PortableText value={body} />
          </div>
        ) : (
          <p className="text-muted text-sm">{t('comingSoon')}</p>
        )}

        <div className="mt-16 pt-8 border-t border-beige">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-widest text-muted hover:text-gold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('backToBlog')}
          </Link>
        </div>
      </div>
    </div>
  )
}
