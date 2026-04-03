import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({
    from: 'SophsCraft <onboarding@resend.dev>',
    to: 'mohammed.benhommane@gmail.com',
    reply_to: email,
    subject: `[Contact] ${subject}`,
    html: `
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <br/>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  })

  if (error) {
    console.error('[contact] Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[contact] Email sent:', data)
  return NextResponse.json({ ok: true })
}
