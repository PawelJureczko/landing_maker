import { createConnection } from 'mysql2/promise'
import { describe, it, expect } from 'vitest'

async function columns(table: string) {
  const conn = await createConnection(process.env.NUXT_DATABASE_URL!)
  const [rows] = await conn.query(`SHOW COLUMNS FROM ${table}`)
  await conn.end()
  return (rows as Array<{ Field: string }>).map((r) => r.Field)
}

describe('tabele Warstwy 2', () => {
  it('users ma oczekiwane kolumny', async () => {
    expect(await columns('users')).toEqual(
      expect.arrayContaining([
        'id', 'email', 'password_hash', 'totp_secret', 'totp_enabled', 'created_at',
      ]),
    )
  })
  it('lead_notes ma oczekiwane kolumny', async () => {
    expect(await columns('lead_notes')).toEqual(
      expect.arrayContaining(['id', 'lead_id', 'author_id', 'body', 'created_at']),
    )
  })
})
