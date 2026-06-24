export interface TotpDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  secret: string | null
  isEnrollment: boolean
  verifyTotp: (secret: string, code: string) => boolean
}

export interface TotpResult {
  status: 200 | 400 | 401 | 429
  body: { ok: boolean; error?: string }
  mfa?: true
  persistSecret?: string
}

export async function handleTotpVerify(input: unknown, deps: TotpDeps): Promise<TotpResult> {
  const { code } = (input ?? {}) as { code?: string }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false, error: 'Zbyt wiele prób. Spróbuj za chwilę.' } }
  }
  if (!deps.secret) {
    return { status: 400, body: { ok: false, error: 'Brak aktywnej sesji logowania.' } }
  }
  if (!code || !deps.verifyTotp(deps.secret, code)) {
    return { status: 401, body: { ok: false, error: 'Nieprawidłowy kod.' } }
  }
  return {
    status: 200,
    body: { ok: true },
    mfa: true,
    persistSecret: deps.isEnrollment ? deps.secret : undefined,
  }
}
