import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sanityClient } from '@/lib/sanity/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

const MAX_QUANTITY = 10

// Seuls l'id et la quantité viennent du navigateur : le prix est relu dans Sanity
type CartItem = {
  id: string
  quantity: number
}

type SanityPrice = {
  _id: string
  nameFR: string
  price: number
  isSoldOut?: boolean
}

type CheckoutBody = {
  email: string
  firstName: string
  lastName: string
  items: CartItem[]
  shippingAddress: Record<string, string>
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json()
    const { email, firstName, lastName, items, shippingAddress } = body

    if (!email || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validItems = items.every(
      (item) =>
        typeof item.id === 'string' &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= MAX_QUANTITY
    )
    if (!validItems) {
      return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })
    }

    const ids = Array.from(new Set(items.map((item) => item.id)))
    const products: SanityPrice[] = await sanityClient.fetch(
      `*[_type == "product" && _id in $ids]{ _id, nameFR, price, isSoldOut }`,
      { ids }
    )
    const byId = new Map(products.map((p) => [p._id, p]))

    const orderItems = []
    let amountCents = 0
    for (const item of items) {
      const product = byId.get(item.id)
      if (!product || typeof product.price !== 'number') {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
      }
      if (product.isSoldOut) {
        return NextResponse.json({ error: `${product.nameFR} is sold out` }, { status: 400 })
      }
      amountCents += Math.round(product.price * 100) * item.quantity
      orderItems.push({ id: product._id, name: product.nameFR, price: product.price, quantity: item.quantity })
    }
    const total = amountCents / 100

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      receipt_email: email,
      payment_method_types: ['card'],
      metadata: { email, firstName: firstName ?? '', lastName: lastName ?? '' },
    })

    await prisma.order.create({
      data: {
        email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        items: orderItems,
        total,
        currency: 'EUR',
        status: 'pending',
        stripeId: paymentIntent.id,
        stripePaymentIntent: paymentIntent.client_secret ?? '',
        shippingAddress: shippingAddress ?? {},
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    // Le détail reste dans les logs Vercel : le client ne voit qu'un message générique
    console.error('[checkout/intent]', err)
    return NextResponse.json(
      { error: 'Le paiement est momentanément indisponible. Veuillez réessayer dans quelques minutes.' },
      { status: 500 }
    )
  }
}
