import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'
import { useDb } from '../../../database/client'
import { leads, leadNotes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })

  const db = useDb()
  const lead = (await db.select().from(leads).where(eq(leads.id, id)))[0]
  if (!lead) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono' })

  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt))
  return { lead, notes }
})
