import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { escapeHtml, isBot, isEmail, oneLine } from '@/lib/forms'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, jewelryType, occasion, budget, materials, description } = body

  // Robot : on répond OK sans rien faire pour ne pas lui signaler le blocage
  if (isBot(body)) {
    return NextResponse.json({ ok: true })
  }

  if (!name || !isEmail(email) || !jewelryType || !budget || !description) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  // Sauvegarde d'abord : la demande n'est jamais perdue, même si l'email échoue
  const header = [
    `Type : ${jewelryType}`,
    occasion && `Occasion : ${occasion}`,
    materials && `Matériaux : ${materials}`,
    phone && `Téléphone : ${phone}`,
  ].filter(Boolean)
  const details = `${header.join('\n')}\n\n${description}`

  await prisma.customRequest.create({
    data: {
      email,
      firstName: oneLine(name, 100),
      message: details.slice(0, 6000),
      budget: oneLine(budget, 100),
    },
  })

  await resend.emails.send({
    from: 'SophsCraft <contact@a2b-consulting.be>',
    to: 'sanaearmel@gmail.com',
    reply_to: email,
    subject: `[Sur-mesure] ${oneLine(jewelryType, 50)} — ${oneLine(name, 60)}`,
    html: `
      <h2>Nouvelle demande sur-mesure</h2>
      <p><strong>Nom :</strong> ${escapeHtml(name, 100)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email, 200)}</p>
      ${phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(phone, 40)}</p>` : ''}
      <hr/>
      <p><strong>Type de bijou :</strong> ${escapeHtml(jewelryType, 100)}</p>
      ${occasion ? `<p><strong>Occasion :</strong> ${escapeHtml(occasion, 200)}</p>` : ''}
      <p><strong>Budget :</strong> ${escapeHtml(budget, 100)}</p>
      ${materials ? `<p><strong>Matériaux :</strong> ${escapeHtml(materials, 300)}</p>` : ''}
      <hr/>
      <p><strong>Description :</strong></p>
      <p>${escapeHtml(description).replace(/\n/g, '<br/>')}</p>
    `,
  })

  // Confirmation au client — volontairement sans reprendre ce qu'il a saisi
  await resend.emails.send({
    from: 'SophsCraft <contact@a2b-consulting.be>',
    to: email,
    subject: 'Votre demande sur-mesure — SophsCraft',
    html: `
      <p>Bonjour,</p>
      <p>Merci pour votre demande de bijou sur-mesure ! Nous l'avons bien reçue et nous vous enverrons une proposition personnalisée sous 48h.</p>
      <p>En attendant, n'hésitez pas à nous contacter à <a href="mailto:contact@sophscraft.com">contact@sophscraft.com</a>.</p>
      <br/>
      <p>À très bientôt,<br/>L'équipe SophsCraft</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
