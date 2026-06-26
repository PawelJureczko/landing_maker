import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../../../utils/auth'
import { validateNoteBody } from '../../../../utils/admin-queries'
import { useDb } from '../../../../database/client'
import { leadNotes } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const leadId = Number(getRouterParam(event, 'id'))
  const { body } = await readBody(event)
  if (!Number.isInteger(leadId)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  const err = validateNoteBody(body)
  if (err) throw createError({ statusCode: 422, statusMessage: err })

  const db = useDb()
  const [res] = await db.insert(leadNotes).values({ leadId, authorId: user.id, body: body.trim() })
  const note = (await db.select().from(leadNotes).where(eq(leadNotes.id, res.insertId)))[0]
  return { ok: true, note }
})
