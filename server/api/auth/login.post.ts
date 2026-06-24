import { eq } from 'drizzle-orm'
import { handleLogin } from '../../utils/handle-login'
import { verifyPassword } from '../../utils/auth'
import { rateLimit } from '../../utils/antispam'
import { useDb } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const result = await handleLogin(input, {
    now: Date.now(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
    rateLimit,
    findUserByEmail: async (email) => {
      const rows = await useDb().select().from(users).where(eq(users.email, email))
      return rows[0] ?? null
    },
    verifyPassword,
  })

  if (result.session) {
    // Sesja "pending" — bez mfa. Pełny dostęp dopiero po 2FA.
    await setUserSession(event, { user: result.session, mfa: false })
  }
  setResponseStatus(event, result.status)
  return result.body
})
