import nodemailer, { type Transporter } from 'nodemailer'
import type { LeadInput } from './validation'

export function buildLeadEmail(
  lead: LeadInput,
  opts: { to: string; from: string },
): { from: string; to: string; subject: string; text: string } {
  const text = [
    `Imię: ${lead.imie}`,
    `Kontakt: ${lead.kontakt}`,
    `Branża: ${lead.branza}`,
    lead.firma ? `Firma: ${lead.firma}` : null,
    lead.wiadomosc ? `Wiadomość: ${lead.wiadomosc}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    from: opts.from,
    to: opts.to,
    subject: `Nowy lead: ${lead.imie} (${lead.branza})`,
    text,
  }
}

let _transport: Transporter | null = null

function getTransport(): Transporter {
  if (_transport) return _transport
  const { smtp } = useRuntimeConfig()
  _transport = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    secure: false,
  })
  return _transport
}

export async function sendLeadNotification(lead: LeadInput): Promise<void> {
  const cfg = useRuntimeConfig()
  const msg = buildLeadEmail(lead, { to: cfg.leadNotifyTo, from: cfg.smtp.from })
  await getTransport().sendMail(msg)
}
