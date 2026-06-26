import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'
import { isValidStatus } from '../../../utils/admin-queries'
import { useDb } from '../../../database/client'
import { leads } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  const { status } = await readBody(event)
  if (!isValidStatus(status)) throw createError({ statusCode: 422, statusMessage: 'Zły status' })

  await useDb().update(leads).set({ status }).where(eq(leads.id, id))
  return { ok: true }
})
