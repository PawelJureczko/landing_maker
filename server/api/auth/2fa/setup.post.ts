import { eq } from 'drizzle-orm'
import { generateSecret, otpauthUrl } from '../../../utils/totp'
import type { AdminSession } from '../../../utils/auth'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession & { pendingSecret?: string }
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }
  // Brama serwerowa: enrollment tylko dla kont bez 2FA. Bez tego zalogowany
  // (pending) user mógłby curl-em wywołać setup i zrotować swój działający sekret.
  const rows = await useDb().select().from(users).where(eq(users.id, session.user.id))
  if (rows[0]?.totpEnabled) {
    throw createError({ statusCode: 409, statusMessage: '2FA jest już skonfigurowane' })
  }
  // Generujemy sekret i trzymamy go w sesji (sealed cookie) do czasu potwierdzenia.
  const secret = generateSecret()
  await setUserSession(event, { ...session, pendingSecret: secret })
  return { otpauthUrl: otpauthUrl(secret, session.user.email), secret }
})
