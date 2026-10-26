import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { escapeHtml } from '@/lib/forms'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

const SHOP_EMAIL = 'sanaearmel@gmail.com'
const FROM = 'SophsCraft <contact@a2b-consulting.be>'

type OrderItem = { name: string; price: number; quantity: number }
type ShippingAddress = { address?: string; postalCode?: string; city?: string; country?: string }

const euros = (amount: number) => amount.toLocaleString('fr-BE', { style: 'currency', currency: 'EUR' })

function itemsTable(items: OrderItem[], total: number) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 0">${escapeHtml(item.name, 200)}</td>
          <td style="padding:6px 12px;text-align:center">× ${item.quantity}</td>
          <td style="padding:6px 0;text-align:right">${euros(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('')
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr style="border-top:1px solid #ddd">
        <td style="padding:8px 0"><strong>Total</strong></td><td></td>
        <td style="padding:8px 0;text-align:right"><strong>${euros(total)}</strong></td>
      </tr>
    </table>`
}

function addressBlock(address: ShippingAddress) {
  return [address.address, `${address.postalCode ?? ''} ${address.city ?? ''}`.trim(), address.country]
    .filter(Boolean)
    .map((line) => escapeHtml(line, 200))
    .join('<br/>')
}

async function sendOrderEmails(order: {
  id: string
  email: string
  firstName: string
  lastName: string
  items: OrderItem[]
  total: number
  shippingAddress: ShippingAddress
}) {
  const reference = order.id.slice(-8).toUpperCase()
  const table = itemsTable(order.items, order.total)
  const address = addressBlock(order.shippingAddress)
  const fullName = escapeHtml(`${order.firstName} ${order.lastName}`.trim(), 200)

  // Confirmation au client
  await resend.emails.send({
    from: FROM,
    to: order.email,
    reply_to: SHOP_EMAIL,
    subject: `Votre commande SophsCraft n° ${reference}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#2C2C2C">
        <h1 style="color:#C9A96E;font-weight:normal">Merci pour votre commande</h1>
        <p>Bonjour ${escapeHtml(order.firstName, 100)},</p>
        <p>Nous avons bien reçu votre paiement. Votre commande n° <strong>${reference}</strong> est en préparation : chaque pièce est emballée avec soin avant l'expédition.</p>
        ${table}
        <h3 style="font-weight:normal;margin-top:24px">Adresse de livraison</h3>
        <p>${fullName}<br/>${address}</p>
        <p>Une question ? Répondez simplement à cet email.</p>
        <p style="color:#6B6560">À très bientôt,<br/>L'équipe SophsCraft</p>
      </div>
    `,
  })

  // Notification à la boutique
  await resend.emails.send({
    from: FROM,
    to: SHOP_EMAIL,
    reply_to: order.email,
    subject: `🛍️ Nouvelle commande ${reference} — ${euros(order.total)}`,
    html: `
      <h2>Nouvelle commande payée</h2>
      <p><strong>Client :</strong> ${fullName} — ${escapeHtml(order.email, 200)}</p>
      ${table}
      <h3>À expédier à</h3>
      <p>${fullName}<br/>${address}</p>
      <p style="color:#888">Référence complète : ${escapeHtml(order.id)}</p>
    `,
  })
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // La signature est calculée sur le corps brut : il ne faut pas le parser avant
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe/webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    // Stripe peut renvoyer le même événement : seul le passage à « paid » déclenche les emails
    const { count } = await prisma.order.updateMany({
      where: { stripeId: intent.id, status: { not: 'paid' } },
      data: { status: 'paid' },
    })
    if (count > 0) {
      const order = await prisma.order.findFirst({ where: { stripeId: intent.id } })
      if (order) {
        try {
          await sendOrderEmails({
            ...order,
            items: order.items as OrderItem[],
            shippingAddress: order.shippingAddress as ShippingAddress,
          })
        } catch (err) {
          console.error('[stripe/webhook] Email error:', err)
        }
      }
    } else {
      console.log('[stripe/webhook] Already processed or unknown order:', intent.id)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await prisma.order.updateMany({
      where: { stripeId: intent.id, status: 'pending' },
      data: { status: 'failed' },
    })
  }

  return NextResponse.json({ received: true })
}
