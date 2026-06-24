import * as v from 'valibot'

export const BRANZE = [
  'Barber', 'Fryzjer', 'Salon kosmetyczny', 'Mechanik',
  'Kwiaciarnia', 'Restauracja / gastronomia', 'Siłownia / fitness', 'Inna',
] as const

export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export function isPhone(s: string): boolean {
  const digits = s.replace(/[\s\-()]/g, '')
  return /^\+?\d{9,15}$/.test(digits)
}

const optionalTrimmed = v.optional(
  v.pipe(v.string(), v.trim()),
  '',
)

export const LeadSchema = v.object({
  imie: v.pipe(v.string(), v.trim(), v.minLength(1, 'Podaj imię')),
  kontakt: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Podaj telefon lub e-mail'),
    v.check((s) => isEmail(s) || isPhone(s), 'Podaj poprawny telefon lub e-mail'),
  ),
  branza: v.picklist(BRANZE, 'Wybierz branżę'),
  firma: optionalTrimmed,
  wiadomosc: optionalTrimmed,
})

export type LeadInput = v.InferOutput<typeof LeadSchema>

export function parseLead(
  input: unknown,
): { ok: true; data: LeadInput } | { ok: false; errors: Record<string, string> } {
  const result = v.safeParse(LeadSchema, input)
  if (result.success) return { ok: true, data: result.output }

  const errors: Record<string, string> = {}
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key
    if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
  }
  return { ok: false, errors }
}
