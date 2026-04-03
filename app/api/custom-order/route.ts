import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const { name, email, phone, jewelryType, occasion, budget, materials, description } =
    await req.json()

  if (!name || !email || !jewelryType || !budget || !description) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'SophsCraft <noreply@sophscraft.com>',
    to: 'contact@sophscraft.com',
    reply_to: email,
    subject: `[Sur-mesure] ${jewelryType} — ${name}`,
    html: `
      <h2>Nouvelle demande sur-mesure</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
      <hr/>
      <p><strong>Type de bijou :</strong> ${jewelryType}</p>
      ${occasion ? `<p><strong>Occasion :</strong> ${occasion}</p>` : ''}
      <p><strong>Budget :</strong> ${budget}</p>
      ${materials ? `<p><strong>Matériaux :</strong> ${materials}</p>` : ''}
      <hr/>
      <p><strong>Description :</strong></p>
      <p>${description.replace(/\n/g, '<br/>')}</p>
    `,
  })

  // Confirmation au client
  await resend.emails.send({
    from: 'SophsCraft <noreply@sophscraft.com>',
    to: email,
    subject: 'Votre demande sur-mesure — SophsCraft',
    html: `
      <p>Bonjour ${name},</p>
      <p>Merci pour votre demande de bijou sur-mesure ! Nous l'avons bien reçue et nous vous enverrons une proposition personnalisée sous 48h.</p>
      <p>En attendant, n'hésitez pas à nous contacter à <a href="mailto:contact@sophscraft.com">contact@sophscraft.com</a>.</p>
      <br/>
      <p>À très bientôt,<br/>L'équipe SophsCraft</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
