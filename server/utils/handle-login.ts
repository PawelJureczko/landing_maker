import { DUMMY_HASH } from './auth'

export interface LoginDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  findUserByEmail: (email: string) => Promise<
    { id: number; email: string; passwordHash: string; totpEnabled: boolean } | null
  >
  verifyPassword: (hash: string, plain: string) => Promise<boolean>
}

export interface LoginResult {
  status: 200 | 401 | 429
  body: { ok: boolean; nextStep?: 'enroll' | 'verify'; error?: string }
  session?: { id: number; email: string }
}

const GENERIC = 'Nieprawidłowy email lub hasło'

export async function handleLogin(input: unknown, deps: LoginDeps): Promise<LoginResult> {
  const { email, password } = (input ?? {}) as { email?: string; password?: string }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false, error: 'Zbyt wiele prób. Spróbuj za chwilę.' } }
  }
  if (!email || !password) {
    return { status: 401, body: { ok: false, error: GENERIC } }
  }

  const user = await deps.findUserByEmail(email.trim().toLowerCase())
  // Nieznany email: i tak weryfikuj wobec atrapy (równanie czasu, brak enumeracji).
  const hash = user?.passwordHash ?? DUMMY_HASH
  const ok = await deps.verifyPassword(hash, password)

  if (!user || !ok) {
    return { status: 401, body: { ok: false, error: GENERIC } }
  }
  return {
    status: 200,
    body: { ok: true, nextStep: user.totpEnabled ? 'verify' : 'enroll' },
    session: { id: user.id, email: user.email },
  }
}
