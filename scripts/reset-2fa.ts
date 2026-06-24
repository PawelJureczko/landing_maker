import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { cliDb } from '../server/utils/cli-db'
import { users } from '../server/database/schema'

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Użycie: npm run user:reset-2fa <email>')
    process.exit(1)
  }
  // Lowercase — konta są przechowywane znormalizowane (patrz create-user.ts).
  const email = arg.trim().toLowerCase()
  const { db, pool } = cliDb()
  await db
    .update(users)
    .set({ totpSecret: null, totpEnabled: false })
    .where(eq(users.email, email))
  await pool.end()
  console.log(`Zresetowano 2FA dla ${email}. Enrollment nastąpi przy następnym logowaniu.`)
}

// Uruchom tylko gdy wywołane jako skrypt (nie przy imporcie).
if (process.argv[1] && process.argv[1].endsWith('reset-2fa.ts')) {
  main().catch((e) => {
    console.error('Nieoczekiwany błąd:', e)
    process.exit(1)
  })
}
