import { eq } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema'
import type { AdminSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }
  const rows = await useDb().select().from(users).where(eq(users.id, session.user.id))
  const totpEnabled = rows[0]?.totpEnabled ?? false
  return { needsEnroll: !totpEnabled }
})
