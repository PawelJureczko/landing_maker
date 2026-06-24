import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { cliDb } from '../server/utils/cli-db'
import { users } from '../server/database/schema'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Użycie: npm run user:reset-2fa <email>')
    process.exit(1)
  }
  const { db, pool } = cliDb()
  await db
    .update(users)
    .set({ totpSecret: null, totpEnabled: false })
    .where(eq(users.email, email))
  await pool.end()
  console.log(`Zresetowano 2FA dla ${email}. Enrollment nastąpi przy następnym logowaniu.`)
}

main()
