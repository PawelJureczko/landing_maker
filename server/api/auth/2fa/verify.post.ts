import { eq } from 'drizzle-orm'
import { handleTotpVerify } from '../../../utils/handle-totp'
import { verifyTotp } from '../../../utils/totp'
import { rateLimit } from '../../../utils/antispam'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema'
import type { AdminSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession & { pendingSecret?: string }
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }

  // Enrollment: sekret z sesji (pendingSecret). Logowanie: sekret z bazy.
  const isEnrollment = Boolean(session.pendingSecret)
  let secret = session.pendingSecret ?? null
  if (!secret) {
    const rows = await useDb().select().from(users).where(eq(users.id, session.user.id))
    secret = rows[0]?.totpSecret ?? null
  }

  const result = await handleTotpVerify(await readBody(event), {
    now: Date.now(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
    rateLimit,
    secret,
    isEnrollment,
    verifyTotp,
  })

  if (result.persistSecret) {
    await useDb()
      .update(users)
      .set({ totpSecret: result.persistSecret, totpEnabled: true })
      .where(eq(users.id, session.user.id))
  }
  if (result.mfa) {
    // Pełna sesja; czyścimy pendingSecret.
    await setUserSession(event, { user: session.user, mfa: true })
  }
  setResponseStatus(event, result.status)
  return result.body
})
