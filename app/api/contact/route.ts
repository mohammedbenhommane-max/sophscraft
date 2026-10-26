import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, isBot, isEmail, oneLine } from '@/lib/forms'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, subject, message } = body

  // Robot : on répond OK sans rien faire pour ne pas lui signaler le blocage
  if (isBot(body)) {
    return NextResponse.json({ ok: true })
  }

  if (!name || !isEmail(email) || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({
    from: 'SophsCraft <contact@a2b-consulting.be>',
    to: 'sanaearmel@gmail.com',
    reply_to: email,
    subject: `[Contact] ${oneLine(subject)}`,
    html: `
      <p><strong>Nom :</strong> ${escapeHtml(name, 100)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email, 200)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(subject, 200)}</p>
      <br/>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `,
  })

  if (error) {
    console.error('[contact] Resend error:', error)
    return NextResponse.json({ error: 'Email error' }, { status: 500 })
  }

  console.log('[contact] Email sent:', data)
  return NextResponse.json({ ok: true })
}
