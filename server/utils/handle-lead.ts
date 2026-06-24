import { parseLead, type LeadInput } from './validation'
import { isHoneypotTripped, isTooFast } from './antispam'

export interface LeadDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  insertLead: (data: LeadInput) => Promise<void>
  sendMail: (lead: LeadInput) => Promise<void>
}

export interface LeadResult {
  status: 200 | 422 | 429 | 500
  body: { ok: boolean; errors?: Record<string, string> }
}

export async function handleLead(input: unknown, deps: LeadDeps): Promise<LeadResult> {
  const payload = (input ?? {}) as { website?: unknown; ts?: unknown }

  // Boty: cichy sukces — nie zdradzamy mechanizmu.
  if (isHoneypotTripped(payload) || isTooFast(payload.ts, deps.now)) {
    return { status: 200, body: { ok: true } }
  }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false } }
  }

  const parsed = parseLead(input)
  if (!parsed.ok) {
    return { status: 422, body: { ok: false, errors: parsed.errors } }
  }

  try {
    await deps.insertLead(parsed.data)
  } catch (err) {
    console.error('[leads] zapis do bazy nieudany', err)
    return { status: 500, body: { ok: false } }
  }

  try {
    await deps.sendMail(parsed.data)
  } catch (err) {
    console.error('[leads] mail nieudany (lead zapisany)', err)
  }

  return { status: 200, body: { ok: true } }
}
