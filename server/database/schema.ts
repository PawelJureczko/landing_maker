import {
  mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean,
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

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  totpSecret: varchar('totp_secret', { length: 255 }),
  totpEnabled: boolean('totp_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const leadNotes = mysqlTable('lead_notes', {
  id: int('id').autoincrement().primaryKey(),
  leadId: int('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  authorId: int('author_id')
    .notNull()
    .references(() => users.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type LeadNote = typeof leadNotes.$inferSelect
export type NewLeadNote = typeof leadNotes.$inferInsert
