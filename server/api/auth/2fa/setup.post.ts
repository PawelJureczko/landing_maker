import { generateSecret, otpauthUrl } from '../../../utils/totp'
import type { AdminSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession & { pendingSecret?: string }
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }
  // Generujemy sekret i trzymamy go w sesji (sealed cookie) do czasu potwierdzenia.
  const secret = generateSecret()
  await setUserSession(event, { ...session, pendingSecret: secret })
  return { otpauthUrl: otpauthUrl(secret, session.user.email), secret }
})
