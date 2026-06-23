import { createConnection } from 'mysql2/promise'
import { describe, it, expect } from 'vitest'

describe('tabela leads', () => {
  it('istnieje i ma oczekiwane kolumny', async () => {
    const conn = await createConnection(process.env.NUXT_DATABASE_URL!)
    const [rows] = await conn.query('SHOW COLUMNS FROM leads')
    const cols = (rows as Array<{ Field: string }>).map((r) => r.Field)
    await conn.end()
    expect(cols).toEqual(
      expect.arrayContaining([
        'id', 'imie', 'kontakt', 'branza', 'firma',
        'wiadomosc', 'source', 'status', 'created_at',
      ]),
    )
  })
})
