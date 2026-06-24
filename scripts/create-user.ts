import 'dotenv/config'
import { createInterface } from 'node:readline'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../server/utils/auth'
import { cliDb } from '../server/utils/cli-db'
import { users } from '../server/database/schema'

export function validateNewUserInput(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Niepoprawny email'
  if (password.length < 10) return 'Hasło musi mieć co najmniej 10 znaków'
  return null
}

function readLines(prompts: string[]): Promise<string[]> {
  return new Promise((resolve) => {
    const answers: string[] = []
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false })
    let idx = 0
    process.stdout.write(prompts[0] ?? '')
    rl.on('line', (line) => {
      answers.push(line)
      idx++
      if (idx < prompts.length) {
        process.stdout.write(prompts[idx])
      } else {
        rl.close()
      }
    })
    rl.on('close', () => resolve(answers))
  })
}

async function main() {
  const [emailRaw, password = ''] = await readLines(['Email: ', 'Hasło (min 10 znaków): '])
  // Normalizujemy do lowercase — logowanie też szuka po lowercase (handleLogin),
  // więc przechowujemy spójnie, by mixed-case email nie zablokował konta.
  const email = (emailRaw ?? '').trim().toLowerCase()

  const err = validateNewUserInput(email, password)
  if (err) {
    console.error('Błąd:', err)
    process.exit(1)
  }

  const { db, pool } = cliDb()
  const existing = await db.select().from(users).where(eq(users.email, email))
  if (existing.length) {
    console.error('Konto z tym emailem już istnieje.')
    await pool.end()
    process.exit(1)
  }
  await db.insert(users).values({ email, passwordHash: await hashPassword(password) })
  await pool.end()
  console.log(`Utworzono konto ${email}. 2FA ustawisz przy pierwszym logowaniu.`)
}

// Uruchom tylko gdy wywołane jako skrypt (nie przy imporcie w teście).
if (process.argv[1] && process.argv[1].endsWith('create-user.ts')) {
  main().catch((e) => {
    console.error('Nieoczekiwany błąd:', e)
    process.exit(1)
  })
}
