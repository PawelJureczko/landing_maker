import { LEAD_STATUSES } from '../database/schema'

export function isValidStatus(s: unknown): boolean {
  return typeof s === 'string' && (LEAD_STATUSES as readonly string[]).includes(s)
}

export function parseLeadQuery(q: Record<string, any>): {
  status?: string
  branza?: string
  q?: string
} {
  const out: { status?: string; branza?: string; q?: string } = {}
  if (isValidStatus(q.status)) out.status = q.status
  if (typeof q.branza === 'string' && q.branza.trim()) out.branza = q.branza.trim()
  if (typeof q.q === 'string' && q.q.trim()) out.q = q.q.trim()
  return out
}

export function validateNoteBody(body: unknown): string | null {
  if (typeof body !== 'string' || !body.trim()) return 'Treść notatki jest wymagana'
  return null
}
