import {
  mysqlTable, int, varchar, text, timestamp, mysqlEnum,
} from 'drizzle-orm/mysql-core'

export const LEAD_STATUSES = [
  'new', 'contacted', 'project_sent', 'revisions', 'won', 'lost',
] as const

export const leads = mysqlTable('leads', {
  id: int('id').autoincrement().primaryKey(),
  imie: varchar('imie', { length: 120 }).notNull(),
  kontakt: varchar('kontakt', { length: 200 }).notNull(),
  branza: varchar('branza', { length: 80 }).notNull(),
  firma: varchar('firma', { length: 200 }),
  wiadomosc: text('wiadomosc'),
  source: varchar('source', { length: 80 }).notNull().default('landing'),
  status: mysqlEnum('status', LEAD_STATUSES).notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
