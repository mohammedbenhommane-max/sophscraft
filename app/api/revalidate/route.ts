import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Webhook Sanity → revalidation ISR
 *
 * Config Sanity webhook :
 *   URL : https://sophscraft.com/api/revalidate?secret=REVALIDATE_SECRET
 *   Trigger : on publish / on unpublish
 *   Projection : { _type, slug }
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  let body: { _type?: string; slug?: { current?: string } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const type = body._type
  const slug = body.slug?.current

  if (!type) {
    return NextResponse.json({ error: 'Missing _type' }, { status: 400 })
  }

  switch (type) {
    case 'product':
      revalidateTag('product')
      if (slug) {
        revalidateTag(`product:${slug}`)
        revalidatePath(`/products/${slug}`)
        revalidatePath(`/en/products/${slug}`)
      }
      revalidatePath('/')
      revalidatePath('/en')
      break

    case 'collection':
      revalidateTag('collection')
      if (slug) {
        revalidateTag(`collection:${slug}`)
        revalidatePath(`/collections/${slug}`)
        revalidatePath(`/en/collections/${slug}`)
      }
      revalidatePath('/collections')
      revalidatePath('/en/collections')
      revalidatePath('/')
      revalidatePath('/en')
      break

    case 'blogPost':
      revalidateTag('blogPost')
      if (slug) {
        revalidateTag(`blogPost:${slug}`)
        revalidatePath(`/blog/${slug}`)
        revalidatePath(`/en/blog/${slug}`)
      }
      revalidatePath('/blog')
      revalidatePath('/en/blog')
      break

    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
  }

  return NextResponse.json({ revalidated: true, type, slug })
}
