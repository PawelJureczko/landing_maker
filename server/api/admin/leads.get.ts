import { and, eq, like, or, desc } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'
import { parseLeadQuery } from '../../utils/admin-queries'
import { useDb } from '../../database/client'
import { leads } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const f = parseLeadQuery(getQuery(event))

  const conditions = []
  if (f.status) conditions.push(eq(leads.status, f.status as any))
  if (f.branza) conditions.push(eq(leads.branza, f.branza))
  if (f.q) conditions.push(or(like(leads.imie, `%${f.q}%`), like(leads.kontakt, `%${f.q}%`)))

  const rows = await useDb()
    .select()
    .from(leads)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt))
  return { leads: rows }
})
