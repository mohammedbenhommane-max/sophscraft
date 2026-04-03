import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getAllBlogPosts } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

export const metadata: Metadata = {
  title: 'Blog — SophsCraft',
}

type Props = { params: { locale: string } }

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPage({ params }: Props) {
  const { locale } = params
  const [posts, t] = await Promise.all([getAllBlogPosts(), getTranslations('blog')])

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-beige/40 py-20 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-3">{t('tag')}</p>
        <h1 className="font-serif text-5xl text-charcoal">{t('title')}</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        {posts.length === 0 ? (
          <p className="text-center text-muted text-sm py-20">{t('empty')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => {
              const title = locale === 'en' ? post.titleEN : post.titleFR
              const validCategories = ['events', 'inspirations', 'presse'] as const
              type CatKey = typeof validCategories[number]
              const categoryLabel = post.category
                ? (validCategories.includes(post.category as CatKey)
                    ? t(`categories.${post.category as CatKey}`)
                    : post.category)
                : null

              return (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-beige mb-4">
                    {post.coverImage ? (
                      <Image
                        src={urlFor(post.coverImage).width(600).url()}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gold/30" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    {categoryLabel && (
                      <span className="text-gold text-[10px] uppercase tracking-widest">{categoryLabel}</span>
                    )}
                    {post.publishedAt && (
                      <>
                        <span className="text-beige">·</span>
                        <span className="text-muted text-[10px]">{formatDate(post.publishedAt, locale)}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif text-xl text-charcoal group-hover:text-gold transition-colors duration-200 leading-snug">
                    {title}
                  </h2>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
