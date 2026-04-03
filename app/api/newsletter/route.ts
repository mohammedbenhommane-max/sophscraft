import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'SophsCraft <hello@sophscraft.com>',
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
