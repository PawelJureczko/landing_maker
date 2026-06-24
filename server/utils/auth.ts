import argon2 from 'argon2'

export interface AdminSession {
  user?: { id: number; email: string }
  mfa?: boolean
}

// Stały hash atrapy (hasło: 'x') — do równania czasu przy nieznanym emailu.
export const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$3Qz8Yx3l2nE0p1aQ0m9b8s7d6f5g4h3j2k1l0z9x8c7'

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id })
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    return false // śmieciowy/niepoprawny hash
  }
}

export function isAdminSession(session: AdminSession | null | undefined): boolean {
  return Boolean(session?.user && session.mfa === true)
}

export async function requireAdmin(event: any): Promise<{ id: number; email: string }> {
  const session = (await getUserSession(event)) as AdminSession
  if (!isAdminSession(session)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user!
}
