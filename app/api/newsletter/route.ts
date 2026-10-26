import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isBot, isEmail } from '@/lib/forms'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body

  // Robot : on répond OK sans rien faire pour ne pas lui signaler le blocage
  if (isBot(body)) {
    return NextResponse.json({ ok: true })
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  // Inscrit enregistré dans l'Audience Resend (désinscription gérée par Resend)
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (audienceId) {
    const { error } = await resend.contacts.create({ audienceId, email, unsubscribed: false })
    if (error) console.error('[newsletter] Resend contact error:', error)
  } else {
    console.error('[newsletter] RESEND_AUDIENCE_ID manquant : inscrit non enregistré')
  }

  await resend.emails.send({
    from: 'SophsCraft <contact@a2b-consulting.be>',
    to: email,
    subject: 'Bienvenue chez SophsCraft ✨',
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: auto; color: #2C2C2C;">
        <h1 style="color: #C9A96E;">Merci de nous rejoindre</h1>
        <p>Vous recevrez en avant-première nos nouvelles collections et offres exclusives.</p>
        <p style="color: #6B6560; font-size: 0.85em;">L'équipe SophsCraft</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
