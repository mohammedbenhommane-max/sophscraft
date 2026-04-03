import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

type CartItem = {
  id: string
  price: number
  quantity: number
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

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
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
        items,
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
    console.error('[checkout/intent]', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
