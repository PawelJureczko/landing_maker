import { handleLead } from '../utils/handle-lead'
import { rateLimit } from '../utils/antispam'
import { sendLeadNotification } from '../utils/mail'
import { useDb } from '../database/client'
import { leads } from '../database/schema'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const result = await handleLead(input, {
    now: Date.now(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
    rateLimit,
    insertLead: async (data) => {
      await useDb().insert(leads).values({ ...data, source: 'landing', status: 'new' })
    },
    sendMail: sendLeadNotification,
  })
  setResponseStatus(event, result.status)
  return result.body
})
