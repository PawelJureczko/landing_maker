# Warstwa 2 — panel admina z 2FA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować panel `/admin` za obowiązkowym logowaniem dwuetapowym (hasło `argon2` + TOTP), pozwalający przeglądać leady, filtrować/szukać, zmieniać status i dopisywać notatki.

**Architecture:** Kontynuacja stacku Warstwy 1 (Nuxt 4 + Nitro, Drizzle + MySQL). Sesje przez `nuxt-auth-utils` (sealed cookie). Logika trzymana w **czystych rdzeniach z wstrzykiwanymi zależnościami** (`handleLogin`, `handleTotpVerify`, walidatory) — testowalnych w node env — a endpointy Nitro i komponenty Vue to cienkie adaptery. Formularze mają logikę w composable'ach (jak `useLeadForm`), bo środowisko Nuxt-vitest się wiesza.

**Tech Stack:** Nuxt 4, Nitro, TypeScript, Drizzle ORM, MySQL 8, `nuxt-auth-utils`, `argon2`, `otpauth`, `qrcode`, `tsx`, Vitest.

## Global Constraints

- Runtime **Node**. Nuxt 4, TS. Cały backend w `server/`. Konta tylko przez CLI — **brak publicznej rejestracji**.
- **2FA obowiązkowe.** Sesja przechowuje `{ user: { id, email }, mfa: boolean }`; `mfa:false` = pending (brak wstępu do panelu). Setup TOTP przy pierwszym logowaniu (`totp_enabled=false`), recovery przez CLI.
- Hasła **`argon2id`**, nigdy nie logowane. Komunikat logowania zawsze ogólny: **„Nieprawidłowy email lub hasło"**. Przy nieznanym emailu i tak weryfikacja wobec atrapy-hasha (brak enumeracji przez timing).
- Sekret sesji: `NUXT_SESSION_PASSWORD` (≥32 znaki) w `.env` — **nigdy nie commituj `.env`**.
- TOTP: okno 30 s, tolerancja **±1 krok**. Status leada walidowany wartością z `LEAD_STATUSES` (`new`, `contacted`, `project_sent`, `revisions`, `won`, `lost`).
- Throttling `rateLimit` (z `server/utils/antispam.ts`, sygnatura `rateLimit(ip, now, limit?, windowMs?) → boolean` gdzie `true` = w limicie) na `/login` i `/2fa/verify`.
- Reuse z Warstwy 1: `useDb()` (`server/database/client.ts`), schemat w `server/database/schema.ts`. Strony marketingowe pozostają prerenderowane.
- Copy widoczne dla użytkownika **po polsku**.

---

## Struktura plików (Warstwa 2)

| Plik | Odpowiedzialność |
|---|---|
| `server/database/schema.ts` | **+** tabele `users`, `leadNotes` + typy |
| `server/utils/auth.ts` | `hashPassword`/`verifyPassword` (argon2), `isAdminSession`, `requireAdmin` |
| `server/utils/totp.ts` | `generateSecret`, `otpauthUrl`, `verifyTotp` |
| `server/utils/handle-login.ts` | rdzeń `handleLogin(input, deps)` |
| `server/utils/handle-totp.ts` | rdzeń `handleTotpVerify(input, deps)` |
| `server/utils/admin-queries.ts` | `parseLeadQuery`, `isValidStatus`, `validateNoteBody` |
| `server/api/auth/login.post.ts` | adapter logowania |
| `server/api/auth/2fa/setup.post.ts` | start enrollmentu (QR) |
| `server/api/auth/2fa/verify.post.ts` | weryfikacja kodu TOTP |
| `server/api/auth/logout.post.ts` | wylogowanie |
| `server/api/admin/leads.get.ts` | lista leadów (filtr/szukajka) |
| `server/api/admin/leads/[id].get.ts` | lead + notatki |
| `server/api/admin/leads/[id].patch.ts` | zmiana statusu |
| `server/api/admin/leads/[id]/notes.post.ts` | dodanie notatki |
| `scripts/create-user.ts`, `scripts/reset-2fa.ts` | CLI |
| `app/layouts/admin.vue` | minimalny layout panelu |
| `app/middleware/admin.ts` | ochrona stron `/admin/**` |
| `app/composables/useAdminLogin.ts`, `useAdmin2fa.ts` | logika formularzy |
| `app/pages/admin/login.vue`, `2fa.vue`, `index.vue`, `leads/[id].vue` | strony panelu |
| `test/**` | testy jednostkowe + composable |

---

## Task 1: Fundament — zależności, sesja, schemat `users` + `lead_notes`, migracja

**Files:**
- Modify: `package.json` (deps + skrypty), `nuxt.config.ts` (modules), `.env.example`, `server/database/schema.ts`
- Test: `test/db/warstwa2-tables.test.ts`

**Interfaces:**
- Produces: tabele `users`, `leadNotes`; typy `User`/`NewUser`, `LeadNote`/`NewLeadNote`. Moduł `nuxt-auth-utils` aktywny, `NUXT_SESSION_PASSWORD` skonfigurowany.

- [ ] **Step 1: Zainstaluj zależności**

```bash
npm i nuxt-auth-utils argon2 otpauth qrcode
npm i -D tsx @types/qrcode
```

- [ ] **Step 2: Zarejestruj moduł i skrypty CLI**

W `nuxt.config.ts` zmień linię modułów na:

```ts
  modules: ['@vueuse/nuxt', 'nuxt-auth-utils'],
```

W `package.json` w `"scripts"` dopisz:

```json
"user:create": "tsx scripts/create-user.ts",
"user:reset-2fa": "tsx scripts/reset-2fa.ts"
```

- [ ] **Step 3: Dodaj sekret sesji do `.env.example` i lokalnego `.env`**

Dopisz do `.env.example`:

```bash
NUXT_SESSION_PASSWORD=zmien-mnie-na-losowy-ciag-min-32-znaki-0000
```

W lokalnym `.env` wygeneruj prawdziwy sekret:

```bash
echo "NUXT_SESSION_PASSWORD=$(openssl rand -base64 33)" >> .env
```

- [ ] **Step 4: Rozszerz `server/database/schema.ts` o `users` i `leadNotes`**

Dodaj `boolean` do importu z `drizzle-orm/mysql-core` i dopisz na końcu pliku:

```ts
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
```

The import line at the top of the file must become:

```ts
import {
  mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean,
} from 'drizzle-orm/mysql-core'
```

- [ ] **Step 5: Wygeneruj i zastosuj migrację**

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
```
Expected: powstaje `server/database/migrations/0001_*.sql` z `CREATE TABLE \`users\`` i `CREATE TABLE \`lead_notes\`` (z kluczami obcymi); migracja zastosowana bez błędu.

- [ ] **Step 6: Napisz test tabel**

`test/db/warstwa2-tables.test.ts`:

```ts
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
```

- [ ] **Step 7: Uruchom test**

Run: `npm test -- test/db/warstwa2-tables.test.ts`
Expected: PASS (2 testy).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts .env.example \
  server/database/schema.ts server/database/migrations test/db/warstwa2-tables.test.ts
git commit -m "feat(admin): fundament Warstwy 2 — sesja, schemat users + lead_notes, migracja"
```

---

## Task 2: `auth.ts` — hasła (argon2) i strażnik sesji

**Files:**
- Create: `server/utils/auth.ts`
- Test: `test/utils/auth.test.ts`

**Interfaces:**
- Produces:
  - `hashPassword(plain: string): Promise<string>`
  - `verifyPassword(hash: string, plain: string): Promise<boolean>`
  - `AdminSession = { user?: { id: number; email: string }; mfa?: boolean }`
  - `isAdminSession(session: AdminSession | null | undefined): boolean` — `true` tylko gdy `user` i `mfa===true`
  - `requireAdmin(event): Promise<{ id: number; email: string }>` — rzuca `401` gdy nie admin
  - `DUMMY_HASH: string` — stały hash atrapy do równania timingu

- [ ] **Step 1: Napisz failujące testy**

`test/utils/auth.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, isAdminSession } from '../../server/utils/auth'

describe('hashPassword / verifyPassword', () => {
  it('weryfikuje poprawne hasło', async () => {
    const hash = await hashPassword('tajneHaslo123')
    expect(hash).not.toContain('tajneHaslo123')
    expect(await verifyPassword(hash, 'tajneHaslo123')).toBe(true)
  })
  it('odrzuca złe hasło', async () => {
    const hash = await hashPassword('tajneHaslo123')
    expect(await verifyPassword(hash, 'zle')).toBe(false)
  })
  it('verifyPassword nie rzuca przy śmieciowym hashu', async () => {
    expect(await verifyPassword('not-a-hash', 'cokolwiek')).toBe(false)
  })
})

describe('isAdminSession', () => {
  it('true tylko dla zalogowanego z mfa', () => {
    expect(isAdminSession({ user: { id: 1, email: 'a@b.pl' }, mfa: true })).toBe(true)
  })
  it('false dla pending (mfa false)', () => {
    expect(isAdminSession({ user: { id: 1, email: 'a@b.pl' }, mfa: false })).toBe(false)
  })
  it('false dla braku sesji/usera', () => {
    expect(isAdminSession(null)).toBe(false)
    expect(isAdminSession({})).toBe(false)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/auth.test.ts`
Expected: FAIL („Cannot find module .../auth").

- [ ] **Step 3: Zaimplementuj `server/utils/auth.ts`**

```ts
import argon2 from 'argon2'

export interface AdminSession {
  user?: { id: number; email: string }
  mfa?: boolean
}

// Stały hash atrapy (hasło: 'x') — do równania czasu przy nieznanym emailu.
export const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$3Qz8Yx3l2nE0p1aQ0m9b8s7d6f5g4h3j2k1l0z9x8c7'

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id })
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    return false // śmieciowy/niepoprawny hash
  }
}

export function isAdminSession(session: AdminSession | null | undefined): boolean {
  return Boolean(session?.user && session.mfa === true)
}

export async function requireAdmin(event: any): Promise<{ id: number; email: string }> {
  const session = (await getUserSession(event)) as AdminSession
  if (!isAdminSession(session)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user!
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/auth.test.ts`
Expected: PASS (6 asercji). Uwaga: jeśli `DUMMY_HASH` zostanie odrzucony jako format przez argon2, test „nie rzuca przy śmieciowym hashu" i tak przechodzi (zwraca `false`); `DUMMY_HASH` służy tylko do spalenia czasu w `handleLogin`.

- [ ] **Step 5: Commit**

```bash
git add server/utils/auth.ts test/utils/auth.test.ts
git commit -m "feat(admin): auth.ts — argon2 + strażnik sesji"
```

---

## Task 3: `totp.ts` — sekret, URL otpauth, weryfikacja kodu

**Files:**
- Create: `server/utils/totp.ts`
- Test: `test/utils/totp.test.ts`

**Interfaces:**
- Produces:
  - `generateSecret(): string` — base32
  - `otpauthUrl(secret: string, email: string): string` — `otpauth://totp/...`
  - `verifyTotp(secret: string, code: string): boolean` — tolerancja ±1 okno

- [ ] **Step 1: Napisz failujące testy**

`test/utils/totp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import * as OTPAuth from 'otpauth'
import { generateSecret, otpauthUrl, verifyTotp } from '../../server/utils/totp'

function currentCode(secret: string): string {
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) })
  return totp.generate()
}

describe('totp', () => {
  it('generuje sekret base32 i poprawny kod przechodzi', () => {
    const secret = generateSecret()
    expect(secret).toMatch(/^[A-Z2-7]+$/)
    expect(verifyTotp(secret, currentCode(secret))).toBe(true)
  })
  it('odrzuca zły kod', () => {
    const secret = generateSecret()
    expect(verifyTotp(secret, '000000')).toBe(false)
  })
  it('otpauthUrl zawiera issuera i email', () => {
    const url = otpauthUrl(generateSecret(), 'admin@witrynovo.pl')
    expect(url).toMatch(/^otpauth:\/\/totp\//)
    expect(url).toContain('witrynovo')
    expect(url).toContain('admin@witrynovo.pl')
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/totp.test.ts`
Expected: FAIL („Cannot find module .../totp").

- [ ] **Step 3: Zaimplementuj `server/utils/totp.ts`**

```ts
import * as OTPAuth from 'otpauth'

const ISSUER = 'witrynovo.pl'

export function generateSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32
}

function totpFor(secret: string, email = ISSUER): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
}

export function otpauthUrl(secret: string, email: string): string {
  return totpFor(secret, email).toString()
}

export function verifyTotp(secret: string, code: string): boolean {
  // window: 1 → tolerancja ±1 krok (rozjazd zegara). validate zwraca delta|null.
  return totpFor(secret).validate({ token: code.trim(), window: 1 }) !== null
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/totp.test.ts`
Expected: PASS (3 testy).

- [ ] **Step 5: Commit**

```bash
git add server/utils/totp.ts test/utils/totp.test.ts
git commit -m "feat(admin): totp.ts — sekret, otpauth URL, weryfikacja"
```

---

## Task 4: CLI — zakładanie konta i reset 2FA

**Files:**
- Create: `server/utils/cli-db.ts`, `scripts/create-user.ts`, `scripts/reset-2fa.ts`
- Test: `test/utils/cli-validate.test.ts`

**Interfaces:**
- Consumes: `hashPassword` (Task 2), schemat `users` (Task 1)
- Produces:
  - `cliDb()` — instancja Drizzle z `process.env.NUXT_DATABASE_URL` (poza kontekstem Nuxt)
  - `validateNewUserInput(email: string, password: string): string | null` — komunikat błędu albo `null` gdy OK

- [ ] **Step 1: Napisz failujące testy walidacji**

`test/utils/cli-validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateNewUserInput } from '../../scripts/create-user'

describe('validateNewUserInput', () => {
  it('akceptuje poprawny email i hasło ≥10 znaków', () => {
    expect(validateNewUserInput('admin@witrynovo.pl', 'dobreHaslo1')).toBeNull()
  })
  it('odrzuca zły email', () => {
    expect(validateNewUserInput('niepoprawny', 'dobreHaslo1')).toMatch(/email/i)
  })
  it('odrzuca za krótkie hasło', () => {
    expect(validateNewUserInput('admin@witrynovo.pl', 'krotkie')).toMatch(/hasło/i)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/cli-validate.test.ts`
Expected: FAIL („Cannot find module .../create-user").

- [ ] **Step 3: Zaimplementuj `server/utils/cli-db.ts`**

```ts
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

// Klient Drizzle dla skryptów CLI (poza kontekstem Nuxt — bez useRuntimeConfig).
export function cliDb() {
  const pool = mysql.createPool(process.env.NUXT_DATABASE_URL!)
  return { db: drizzle(pool, { schema, mode: 'default' }), pool }
}
```

- [ ] **Step 4: Zaimplementuj `scripts/create-user.ts`**

```ts
import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../server/utils/auth'
import { cliDb } from '../server/utils/cli-db'
import { users } from '../server/database/schema'

export function validateNewUserInput(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Niepoprawny email'
  if (password.length < 10) return 'Hasło musi mieć co najmniej 10 znaków'
  return null
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const email = (await rl.question('Email: ')).trim()
  const password = await rl.question('Hasło (min 10 znaków): ')
  rl.close()

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
  main()
}
```

- [ ] **Step 5: Zaimplementuj `scripts/reset-2fa.ts`**

```ts
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
```

- [ ] **Step 6: Uruchom test walidacji — ma przejść**

Run: `npm test -- test/utils/cli-validate.test.ts`
Expected: PASS (3 testy).

- [ ] **Step 7: Smoke CLI (ręcznie, żywy Docker)**

```bash
echo -e "admin@witrynovo.pl\nadminHaslo123" | npm run user:create
docker compose exec -T mysql mysql -uroot -proot witrynovo -e "SELECT id,email,totp_enabled FROM users;"
```
Expected: wiersz `admin@witrynovo.pl`, `totp_enabled=0`.

- [ ] **Step 8: Commit**

```bash
git add server/utils/cli-db.ts scripts/create-user.ts scripts/reset-2fa.ts test/utils/cli-validate.test.ts
git commit -m "feat(admin): CLI user:create + user:reset-2fa"
```

---

## Task 5: Logowanie — rdzeń `handleLogin` + endpoint + strona

**Files:**
- Create: `server/utils/handle-login.ts`, `server/api/auth/login.post.ts`, `app/composables/useAdminLogin.ts`, `app/pages/admin/login.vue`, `app/layouts/admin.vue`
- Test: `test/utils/handle-login.test.ts`

**Interfaces:**
- Consumes: `verifyPassword`, `DUMMY_HASH`, `AdminSession` (Task 2); `rateLimit` (antispam); schemat `users`.
- Produces:
  - `LoginDeps = { now: number; ip: string; rateLimit: (ip: string, now: number) => boolean; findUserByEmail: (email: string) => Promise<{ id: number; email: string; passwordHash: string; totpEnabled: boolean } | null>; verifyPassword: (hash: string, plain: string) => Promise<boolean> }`
  - `LoginResult = { status: 200 | 401 | 429; body: { ok: boolean; nextStep?: 'enroll' | 'verify'; error?: string }; session?: { id: number; email: string } }`
  - `handleLogin(input: unknown, deps: LoginDeps): Promise<LoginResult>`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/handle-login.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { handleLogin, type LoginDeps } from '../../server/utils/handle-login'

const user = { id: 1, email: 'admin@witrynovo.pl', passwordHash: 'HASH', totpEnabled: false }

function deps(over: Partial<LoginDeps> = {}): LoginDeps {
  return {
    now: 1000,
    ip: '1.1.1.1',
    rateLimit: () => true,
    findUserByEmail: vi.fn(async () => user),
    verifyPassword: vi.fn(async () => true),
    ...over,
  }
}

const body = { email: 'admin@witrynovo.pl', password: 'dobreHaslo1' }

describe('handleLogin', () => {
  it('poprawne dane, totp wyłączone → 200 + nextStep enroll + session', async () => {
    const r = await handleLogin(body, deps())
    expect(r.status).toBe(200)
    expect(r.body.nextStep).toBe('enroll')
    expect(r.session).toEqual({ id: 1, email: 'admin@witrynovo.pl' })
  })

  it('poprawne dane, totp włączone → nextStep verify', async () => {
    const d = deps({ findUserByEmail: vi.fn(async () => ({ ...user, totpEnabled: true })) })
    const r = await handleLogin(body, d)
    expect(r.body.nextStep).toBe('verify')
  })

  it('złe hasło → 401 ogólny komunikat, brak session', async () => {
    const d = deps({ verifyPassword: vi.fn(async () => false) })
    const r = await handleLogin(body, d)
    expect(r.status).toBe(401)
    expect(r.session).toBeUndefined()
    expect(r.body.error).toMatch(/email lub hasło/i)
  })

  it('nieznany email → 401 + i tak woła verifyPassword (równanie timingu)', async () => {
    const verify = vi.fn(async () => false)
    const d = deps({ findUserByEmail: vi.fn(async () => null), verifyPassword: verify })
    const r = await handleLogin(body, d)
    expect(r.status).toBe(401)
    expect(verify).toHaveBeenCalledOnce()
  })

  it('przekroczony limit → 429', async () => {
    const r = await handleLogin(body, deps({ rateLimit: () => false }))
    expect(r.status).toBe(429)
  })

  it('brak email/hasła → 401', async () => {
    const r = await handleLogin({ email: '', password: '' }, deps())
    expect(r.status).toBe(401)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/handle-login.test.ts`
Expected: FAIL („Cannot find module .../handle-login").

- [ ] **Step 3: Zaimplementuj `server/utils/handle-login.ts`**

```ts
import { DUMMY_HASH } from './auth'

export interface LoginDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  findUserByEmail: (email: string) => Promise<
    { id: number; email: string; passwordHash: string; totpEnabled: boolean } | null
  >
  verifyPassword: (hash: string, plain: string) => Promise<boolean>
}

export interface LoginResult {
  status: 200 | 401 | 429
  body: { ok: boolean; nextStep?: 'enroll' | 'verify'; error?: string }
  session?: { id: number; email: string }
}

const GENERIC = 'Nieprawidłowy email lub hasło'

export async function handleLogin(input: unknown, deps: LoginDeps): Promise<LoginResult> {
  const { email, password } = (input ?? {}) as { email?: string; password?: string }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false, error: 'Zbyt wiele prób. Spróbuj za chwilę.' } }
  }
  if (!email || !password) {
    return { status: 401, body: { ok: false, error: GENERIC } }
  }

  const user = await deps.findUserByEmail(email.trim().toLowerCase())
  // Nieznany email: i tak weryfikuj wobec atrapy (równanie czasu, brak enumeracji).
  const hash = user?.passwordHash ?? DUMMY_HASH
  const ok = await deps.verifyPassword(hash, password)

  if (!user || !ok) {
    return { status: 401, body: { ok: false, error: GENERIC } }
  }
  return {
    status: 200,
    body: { ok: true, nextStep: user.totpEnabled ? 'verify' : 'enroll' },
    session: { id: user.id, email: user.email },
  }
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/handle-login.test.ts`
Expected: PASS (6 przypadków).

- [ ] **Step 5: Zaimplementuj adapter `server/api/auth/login.post.ts`**

```ts
import { eq } from 'drizzle-orm'
import { handleLogin } from '../../utils/handle-login'
import { verifyPassword } from '../../utils/auth'
import { rateLimit } from '../../utils/antispam'
import { useDb } from '../../database/client'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const result = await handleLogin(input, {
    now: Date.now(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
    rateLimit,
    findUserByEmail: async (email) => {
      const rows = await useDb().select().from(users).where(eq(users.email, email))
      return rows[0] ?? null
    },
    verifyPassword,
  })

  if (result.session) {
    // Sesja "pending" — bez mfa. Pełny dostęp dopiero po 2FA.
    await setUserSession(event, { user: result.session, mfa: false })
  }
  setResponseStatus(event, result.status)
  return result.body
})
```

- [ ] **Step 6: Zaimplementuj `app/layouts/admin.vue`**

```vue
<template>
  <div class="min-h-screen bg-bg text-fg">
    <slot />
  </div>
</template>
```

- [ ] **Step 7: Zaimplementuj `app/composables/useAdminLogin.ts`**

```ts
import { reactive, ref } from 'vue'

export function useAdminLogin() {
  const form = reactive({ email: '', password: '' })
  const error = ref('')
  const loading = ref(false)
  const nextStep = ref<'enroll' | 'verify' | ''>('')

  async function submit() {
    error.value = ''
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; nextStep?: 'enroll' | 'verify' }>(
        '/api/auth/login',
        { method: 'POST', body: { email: form.email, password: form.password } },
      )
      nextStep.value = res.nextStep ?? 'verify'
    } catch (e: any) {
      error.value = e?.data?.error ?? 'Coś poszło nie tak. Spróbuj ponownie.'
    } finally {
      loading.value = false
    }
    return nextStep.value
  }

  return { form, error, loading, nextStep, submit }
}
```

- [ ] **Step 8: Zaimplementuj `app/pages/admin/login.vue`**

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { form, error, loading, submit } = useAdminLogin()

async function onSubmit() {
  const step = await submit()
  if (step) await navigateTo('/admin/2fa')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
    <h1 class="display text-2xl">Panel witrynovo.pl</h1>
    <p class="mt-1 text-sm text-fg/60">Zaloguj się, aby zarządzać leadami.</p>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="l-email" class="mb-1 block text-sm text-fg/70">Email</label>
        <input id="l-email" v-model="form.email" type="email" autocomplete="username"
          class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 outline-none focus-visible:border-brand" />
      </div>
      <div>
        <label for="l-pass" class="mb-1 block text-sm text-fg/70">Hasło</label>
        <input id="l-pass" v-model="form.password" type="password" autocomplete="current-password"
          class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 outline-none focus-visible:border-brand" />
      </div>
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Logowanie…' : 'Zaloguj' }}
      </button>
    </form>
  </main>
</template>
```

- [ ] **Step 9: Test composable + pełna suita**

`test/components/admin-login.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdminLogin } from '../../app/composables/useAdminLogin'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch
beforeEach(() => mockFetch.mockReset())

describe('useAdminLogin', () => {
  it('zwraca nextStep z odpowiedzi', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, nextStep: 'verify' })
    const f = useAdminLogin()
    Object.assign(f.form, { email: 'a@b.pl', password: 'x' })
    const step = await f.submit()
    expect(step).toBe('verify')
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
  })
  it('mapuje błąd serwera', async () => {
    mockFetch.mockRejectedValueOnce({ data: { error: 'Nieprawidłowy email lub hasło' } })
    const f = useAdminLogin()
    await f.submit()
    expect(f.error.value).toMatch(/email lub hasło/i)
  })
})
```

Run: `npm test -- test/components/admin-login.test.ts` → PASS, potem `npm test` → cała suita zielona.

- [ ] **Step 10: Commit**

```bash
git add server/utils/handle-login.ts server/api/auth/login.post.ts \
  app/layouts/admin.vue app/composables/useAdminLogin.ts app/pages/admin/login.vue \
  test/utils/handle-login.test.ts test/components/admin-login.test.ts
git commit -m "feat(admin): logowanie — handleLogin + endpoint + strona"
```

---

## Task 6: 2FA — rdzeń `handleTotpVerify` + setup/verify/logout + strona

**Files:**
- Create: `server/utils/handle-totp.ts`, `server/api/auth/2fa/setup.post.ts`, `server/api/auth/2fa/verify.post.ts`, `server/api/auth/logout.post.ts`, `app/composables/useAdmin2fa.ts`, `app/pages/admin/2fa.vue`
- Test: `test/utils/handle-totp.test.ts`

**Interfaces:**
- Consumes: `verifyTotp` (Task 3); `rateLimit`; `AdminSession`; schemat `users`.
- Produces:
  - `TotpDeps = { now: number; ip: string; rateLimit: (ip: string, now: number) => boolean; secret: string | null; isEnrollment: boolean; verifyTotp: (secret: string, code: string) => boolean }`
  - `TotpResult = { status: 200 | 400 | 401 | 429; body: { ok: boolean; error?: string }; mfa?: true; persistSecret?: string }`
  - `handleTotpVerify(input: unknown, deps: TotpDeps): Promise<TotpResult>`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/handle-totp.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { handleTotpVerify, type TotpDeps } from '../../server/utils/handle-totp'

function deps(over: Partial<TotpDeps> = {}): TotpDeps {
  return {
    now: 1000,
    ip: '1.1.1.1',
    rateLimit: () => true,
    secret: 'SECRET',
    isEnrollment: false,
    verifyTotp: () => true,
    ...over,
  }
}

describe('handleTotpVerify', () => {
  it('poprawny kod (logowanie) → 200 + mfa, bez persistSecret', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps())
    expect(r.status).toBe(200)
    expect(r.mfa).toBe(true)
    expect(r.persistSecret).toBeUndefined()
  })
  it('poprawny kod (enrollment) → 200 + mfa + persistSecret', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ isEnrollment: true }))
    expect(r.mfa).toBe(true)
    expect(r.persistSecret).toBe('SECRET')
  })
  it('zły kod → 401, brak mfa', async () => {
    const r = await handleTotpVerify({ code: '000000' }, deps({ verifyTotp: () => false }))
    expect(r.status).toBe(401)
    expect(r.mfa).toBeUndefined()
  })
  it('brak sekretu w sesji → 400', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ secret: null }))
    expect(r.status).toBe(400)
  })
  it('przekroczony limit → 429', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ rateLimit: () => false }))
    expect(r.status).toBe(429)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/handle-totp.test.ts`
Expected: FAIL („Cannot find module .../handle-totp").

- [ ] **Step 3: Zaimplementuj `server/utils/handle-totp.ts`**

```ts
export interface TotpDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  secret: string | null
  isEnrollment: boolean
  verifyTotp: (secret: string, code: string) => boolean
}

export interface TotpResult {
  status: 200 | 400 | 401 | 429
  body: { ok: boolean; error?: string }
  mfa?: true
  persistSecret?: string
}

export async function handleTotpVerify(input: unknown, deps: TotpDeps): Promise<TotpResult> {
  const { code } = (input ?? {}) as { code?: string }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false, error: 'Zbyt wiele prób. Spróbuj za chwilę.' } }
  }
  if (!deps.secret) {
    return { status: 400, body: { ok: false, error: 'Brak aktywnej sesji logowania.' } }
  }
  if (!code || !deps.verifyTotp(deps.secret, code)) {
    return { status: 401, body: { ok: false, error: 'Nieprawidłowy kod.' } }
  }
  return {
    status: 200,
    body: { ok: true },
    mfa: true,
    persistSecret: deps.isEnrollment ? deps.secret : undefined,
  }
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/handle-totp.test.ts`
Expected: PASS (5 przypadków).

- [ ] **Step 5: Zaimplementuj `server/api/auth/2fa/setup.post.ts`**

```ts
import { generateSecret, otpauthUrl } from '../../../utils/totp'
import type { AdminSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession & { pendingSecret?: string }
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }
  // Generujemy sekret i trzymamy go w sesji (sealed cookie) do czasu potwierdzenia.
  const secret = generateSecret()
  await setUserSession(event, { ...session, pendingSecret: secret })
  return { otpauthUrl: otpauthUrl(secret, session.user.email), secret }
})
```

- [ ] **Step 6: Zaimplementuj `server/api/auth/2fa/verify.post.ts`**

```ts
import { eq } from 'drizzle-orm'
import { handleTotpVerify } from '../../../utils/handle-totp'
import { verifyTotp } from '../../../utils/totp'
import { rateLimit } from '../../../utils/antispam'
import { useDb } from '../../../database/client'
import { users } from '../../../database/schema'
import type { AdminSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as AdminSession & { pendingSecret?: string }
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Brak sesji logowania' })
  }

  // Enrollment: sekret z sesji (pendingSecret). Logowanie: sekret z bazy.
  const isEnrollment = Boolean(session.pendingSecret)
  let secret = session.pendingSecret ?? null
  if (!secret) {
    const rows = await useDb().select().from(users).where(eq(users.id, session.user.id))
    secret = rows[0]?.totpSecret ?? null
  }

  const result = await handleTotpVerify(await readBody(event), {
    now: Date.now(),
    ip: getRequestIP(event, { xForwardedFor: true }) ?? 'unknown',
    rateLimit,
    secret,
    isEnrollment,
    verifyTotp,
  })

  if (result.persistSecret) {
    await useDb()
      .update(users)
      .set({ totpSecret: result.persistSecret, totpEnabled: true })
      .where(eq(users.id, session.user.id))
  }
  if (result.mfa) {
    // Pełna sesja; czyścimy pendingSecret.
    await setUserSession(event, { user: session.user, mfa: true })
  }
  setResponseStatus(event, result.status)
  return result.body
})
```

- [ ] **Step 7: Zaimplementuj `server/api/auth/logout.post.ts`**

```ts
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { ok: true }
})
```

- [ ] **Step 8: Zaimplementuj `app/composables/useAdmin2fa.ts`**

```ts
import { ref } from 'vue'

export function useAdmin2fa() {
  const code = ref('')
  const error = ref('')
  const loading = ref(false)
  const qrUrl = ref('') // otpauth:// URL do wyrenderowania jako QR
  const secret = ref('')

  async function startEnroll() {
    const res = await $fetch<{ otpauthUrl: string; secret: string }>('/api/auth/2fa/setup', {
      method: 'POST',
    })
    qrUrl.value = res.otpauthUrl
    secret.value = res.secret
  }

  async function verify() {
    error.value = ''
    loading.value = true
    try {
      await $fetch('/api/auth/2fa/verify', { method: 'POST', body: { code: code.value } })
      return true
    } catch (e: any) {
      error.value = e?.data?.error ?? 'Nieprawidłowy kod.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { code, error, loading, qrUrl, secret, startEnroll, verify }
}
```

- [ ] **Step 9: Zaimplementuj `app/pages/admin/2fa.vue`**

```vue
<script setup lang="ts">
import QRCode from 'qrcode'
definePageMeta({ layout: 'admin' })

const { code, error, loading, qrUrl, secret, startEnroll, verify } = useAdmin2fa()
const { session } = useUserSession()
const qrImg = ref('')
const enrolling = ref(false)

onMounted(async () => {
  // Jeśli konto nie ma jeszcze 2FA, backend ustawi pendingSecret przy setup.
  // Próba enrollmentu: pobierz QR. Gdy konto ma już 2FA, setup też zwróci nowy
  // sekret, ale zwykłe logowanie używa /verify bez setup — patrz logika niżej.
  enrolling.value = !(session.value as any)?.totpEnabled
})

async function beginEnroll() {
  await startEnroll()
  qrImg.value = await QRCode.toDataURL(qrUrl.value)
}

async function onVerify() {
  if (await verify()) await navigateTo('/admin')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
    <h1 class="display text-2xl">Weryfikacja dwuetapowa</h1>

    <div v-if="enrolling && !qrImg" class="mt-6">
      <p class="text-sm text-fg/70">
        Pierwsze logowanie — skonfiguruj aplikację authenticator.
      </p>
      <button class="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        @click="beginEnroll">
        Pokaż kod QR
      </button>
    </div>

    <div v-else-if="enrolling && qrImg" class="mt-6">
      <p class="text-sm text-fg/70">Zeskanuj w aplikacji (Google Authenticator / Aegis):</p>
      <img :src="qrImg" alt="Kod QR 2FA" class="mt-3 h-44 w-44 rounded-xl bg-white p-2" />
      <p class="mt-2 break-all text-xs text-fg/50">Sekret: {{ secret }}</p>
    </div>

    <p v-else class="mt-6 text-sm text-fg/70">Podaj kod z aplikacji authenticator.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onVerify">
      <input v-model="code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"
        class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-center tracking-widest outline-none focus-visible:border-brand" />
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Sprawdzam…' : 'Potwierdź' }}
      </button>
    </form>
  </main>
</template>
```

- [ ] **Step 10: Test composable + pełna suita**

`test/components/admin-2fa.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdmin2fa } from '../../app/composables/useAdmin2fa'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch
beforeEach(() => mockFetch.mockReset())

describe('useAdmin2fa', () => {
  it('startEnroll pobiera otpauthUrl', async () => {
    mockFetch.mockResolvedValueOnce({ otpauthUrl: 'otpauth://totp/x', secret: 'S' })
    const f = useAdmin2fa()
    await f.startEnroll()
    expect(f.qrUrl.value).toBe('otpauth://totp/x')
    expect(f.secret.value).toBe('S')
  })
  it('verify zwraca true przy sukcesie', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const f = useAdmin2fa()
    f.code.value = '123456'
    expect(await f.verify()).toBe(true)
  })
  it('verify mapuje błąd i zwraca false', async () => {
    mockFetch.mockRejectedValueOnce({ data: { error: 'Nieprawidłowy kod.' } })
    const f = useAdmin2fa()
    expect(await f.verify()).toBe(false)
    expect(f.error.value).toMatch(/kod/i)
  })
})
```

Run: `npm test -- test/components/admin-2fa.test.ts` → PASS, potem `npm test` → cała suita zielona.

- [ ] **Step 11: Commit**

```bash
git add server/utils/handle-totp.ts server/api/auth/2fa app/composables/useAdmin2fa.ts \
  app/pages/admin/2fa.vue server/api/auth/logout.post.ts test/utils/handle-totp.test.ts \
  test/components/admin-2fa.test.ts
git commit -m "feat(admin): 2FA — handleTotpVerify, setup/verify/logout, strona"
```

---

## Task 7: Ochrona tras + lista leadów (filtr/szukajka)

**Files:**
- Create: `app/middleware/admin.ts`, `server/utils/admin-queries.ts`, `server/api/admin/leads.get.ts`, `app/pages/admin/index.vue`
- Test: `test/utils/admin-queries.test.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 2); `LEAD_STATUSES`, `leads` (schemat).
- Produces:
  - `parseLeadQuery(q: Record<string, any>): { status?: string; branza?: string; q?: string }` — odrzuca status spoza `LEAD_STATUSES`
  - `isValidStatus(s: unknown): boolean`
  - `GET /api/admin/leads` zwraca `{ leads: Lead[] }`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/admin-queries.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseLeadQuery, isValidStatus } from '../../server/utils/admin-queries'

describe('isValidStatus', () => {
  it('akceptuje status z enuma', () => expect(isValidStatus('won')).toBe(true))
  it('odrzuca spoza enuma', () => expect(isValidStatus('foo')).toBe(false))
})

describe('parseLeadQuery', () => {
  it('przepuszcza poprawny status, branżę i q', () => {
    expect(parseLeadQuery({ status: 'new', branza: 'Barber', q: 'jan' }))
      .toEqual({ status: 'new', branza: 'Barber', q: 'jan' })
  })
  it('pomija niepoprawny status', () => {
    expect(parseLeadQuery({ status: 'foo' })).toEqual({})
  })
  it('pomija puste wartości', () => {
    expect(parseLeadQuery({ status: '', branza: '', q: '' })).toEqual({})
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/admin-queries.test.ts`
Expected: FAIL („Cannot find module .../admin-queries").

- [ ] **Step 3: Zaimplementuj `server/utils/admin-queries.ts`**

```ts
import { LEAD_STATUSES } from '../database/schema'

export function isValidStatus(s: unknown): boolean {
  return typeof s === 'string' && (LEAD_STATUSES as readonly string[]).includes(s)
}

export function parseLeadQuery(q: Record<string, any>): {
  status?: string
  branza?: string
  q?: string
} {
  const out: { status?: string; branza?: string; q?: string } = {}
  if (isValidStatus(q.status)) out.status = q.status
  if (typeof q.branza === 'string' && q.branza.trim()) out.branza = q.branza.trim()
  if (typeof q.q === 'string' && q.q.trim()) out.q = q.q.trim()
  return out
}

export function validateNoteBody(body: unknown): string | null {
  if (typeof body !== 'string' || !body.trim()) return 'Treść notatki jest wymagana'
  return null
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/admin-queries.test.ts`
Expected: PASS (5 asercji).

- [ ] **Step 5: Zaimplementuj middleware `app/middleware/admin.ts`**

```ts
// Chroni strony /admin/** poza login/2fa — wymaga pełnej sesji (mfa).
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin/login' || to.path === '/admin/2fa') return
  const { session } = useUserSession()
  if (!(session.value as any)?.mfa) {
    return navigateTo('/admin/login')
  }
})
```

- [ ] **Step 6: Zaimplementuj `server/api/admin/leads.get.ts`**

```ts
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
```

- [ ] **Step 7: Zaimplementuj `app/pages/admin/index.vue`**

```vue
<script setup lang="ts">
import type { Lead } from '../../../server/database/schema'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const status = ref('')
const q = ref('')
const STATUSY = ['new', 'contacted', 'project_sent', 'revisions', 'won', 'lost']

const { data, refresh } = await useFetch<{ leads: Lead[] }>('/api/admin/leads', {
  query: { status, q },
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <div class="flex items-center justify-between">
      <h1 class="display text-2xl">Leady</h1>
      <button class="text-sm text-fg/60 underline" @click="logout">Wyloguj</button>
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      <select v-model="status" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm" @change="refresh()">
        <option value="">Wszystkie statusy</option>
        <option v-for="s in STATUSY" :key="s" :value="s">{{ s }}</option>
      </select>
      <input v-model="q" placeholder="Szukaj (imię / kontakt)" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm"
        @keyup.enter="refresh()" />
    </div>

    <table class="mt-6 w-full text-left text-sm">
      <thead class="text-fg/50">
        <tr><th class="py-2">Imię</th><th>Kontakt</th><th>Branża</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="l in data?.leads ?? []" :key="l.id" class="border-t border-line">
          <td class="py-2">{{ l.imie }}</td>
          <td>{{ l.kontakt }}</td>
          <td>{{ l.branza }}</td>
          <td>{{ l.status }}</td>
          <td><NuxtLink :to="`/admin/leads/${l.id}`" class="text-brand-2 underline">otwórz</NuxtLink></td>
        </tr>
        <tr v-if="!(data?.leads?.length)"><td colspan="5" class="py-6 text-center text-fg/50">Brak leadów.</td></tr>
      </tbody>
    </table>
  </main>
</template>
```

- [ ] **Step 8: Uruchom pełną suitę**

Run: `npm test`
Expected: PASS — wszystkie pliki, w tym nowy `admin-queries`.

- [ ] **Step 9: Commit**

```bash
git add app/middleware/admin.ts server/utils/admin-queries.ts server/api/admin/leads.get.ts \
  app/pages/admin/index.vue test/utils/admin-queries.test.ts
git commit -m "feat(admin): ochrona tras + lista leadów z filtrem i szukajką"
```

---

## Task 8: Szczegół leada — zmiana statusu + notatki

**Files:**
- Create: `server/api/admin/leads/[id].get.ts`, `server/api/admin/leads/[id].patch.ts`, `server/api/admin/leads/[id]/notes.post.ts`, `app/pages/admin/leads/[id].vue`
- Test: `test/utils/note-validation.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`; `isValidStatus`, `validateNoteBody` (Task 7); `leads`, `leadNotes` (schemat).
- Produces:
  - `GET /api/admin/leads/[id]` → `{ lead: Lead; notes: LeadNote[] }`
  - `PATCH /api/admin/leads/[id]` (body `{ status }`) → `{ ok: true }`
  - `POST /api/admin/leads/[id]/notes` (body `{ body }`) → `{ ok: true; note: LeadNote }`

- [ ] **Step 1: Napisz failujący test walidacji notatki**

`test/utils/note-validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateNoteBody } from '../../server/utils/admin-queries'

describe('validateNoteBody', () => {
  it('akceptuje niepustą treść', () => expect(validateNoteBody('cześć')).toBeNull())
  it('odrzuca pustą/whitespace', () => {
    expect(validateNoteBody('   ')).toMatch(/wymagana/i)
    expect(validateNoteBody(123)).toMatch(/wymagana/i)
  })
})
```

- [ ] **Step 2: Uruchom — ma przejść (funkcja istnieje z Task 7)**

Run: `npm test -- test/utils/note-validation.test.ts`
Expected: PASS (funkcja `validateNoteBody` została dodana w Task 7 — ten test domyka jej pokrycie). Jeśli FAIL, sprawdź eksport w `admin-queries.ts`.

- [ ] **Step 3: Zaimplementuj `server/api/admin/leads/[id].get.ts`**

```ts
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'
import { useDb } from '../../../database/client'
import { leads, leadNotes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })

  const db = useDb()
  const lead = (await db.select().from(leads).where(eq(leads.id, id)))[0]
  if (!lead) throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono' })

  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt))
  return { lead, notes }
})
```

- [ ] **Step 4: Zaimplementuj `server/api/admin/leads/[id].patch.ts`**

```ts
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'
import { isValidStatus } from '../../../utils/admin-queries'
import { useDb } from '../../../database/client'
import { leads } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const { status } = await readBody(event)
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
  if (!isValidStatus(status)) throw createError({ statusCode: 422, statusMessage: 'Zły status' })

  await useDb().update(leads).set({ status }).where(eq(leads.id, id))
  return { ok: true }
})
```

- [ ] **Step 5: Zaimplementuj `server/api/admin/leads/[id]/notes.post.ts`**

```ts
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
```

- [ ] **Step 6: Zaimplementuj `app/pages/admin/leads/[id].vue`**

```vue
<script setup lang="ts">
import type { Lead, LeadNote } from '../../../../server/database/schema'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const STATUSY = ['new', 'contacted', 'project_sent', 'revisions', 'won', 'lost']
const { data, refresh } = await useFetch<{ lead: Lead; notes: LeadNote[] }>(
  `/api/admin/leads/${route.params.id}`,
)

const noteBody = ref('')

async function setStatus(status: string) {
  await $fetch(`/api/admin/leads/${route.params.id}`, { method: 'PATCH', body: { status } })
  await refresh()
}
async function addNote() {
  if (!noteBody.value.trim()) return
  await $fetch(`/api/admin/leads/${route.params.id}/notes`, {
    method: 'POST',
    body: { body: noteBody.value },
  })
  noteBody.value = ''
  await refresh()
}
</script>

<template>
  <main v-if="data" class="mx-auto max-w-3xl px-6 py-10">
    <NuxtLink to="/admin" class="text-sm text-brand-2 underline">&larr; Wszystkie leady</NuxtLink>
    <h1 class="display mt-3 text-2xl">{{ data.lead.imie }}</h1>
    <dl class="mt-4 space-y-1 text-sm text-fg/80">
      <div><span class="text-fg/50">Kontakt:</span> {{ data.lead.kontakt }}</div>
      <div><span class="text-fg/50">Branża:</span> {{ data.lead.branza }}</div>
      <div v-if="data.lead.firma"><span class="text-fg/50">Firma:</span> {{ data.lead.firma }}</div>
      <div v-if="data.lead.wiadomosc"><span class="text-fg/50">Wiadomość:</span> {{ data.lead.wiadomosc }}</div>
    </dl>

    <div class="mt-6">
      <label class="mb-1 block text-sm text-fg/50">Status</label>
      <select :value="data.lead.status" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm"
        @change="setStatus(($event.target as HTMLSelectElement).value)">
        <option v-for="s in STATUSY" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <section class="mt-8">
      <h2 class="text-lg font-semibold">Notatki</h2>
      <form class="mt-3 flex gap-2" @submit.prevent="addNote">
        <input v-model="noteBody" placeholder="Dopisz notatkę…"
          class="flex-1 rounded-lg border border-line bg-white/5 px-3 py-2 text-sm" />
        <button class="rounded-lg bg-brand px-4 text-sm font-semibold text-white">Dodaj</button>
      </form>
      <ul class="mt-4 space-y-3">
        <li v-for="n in data.notes" :key="n.id" class="rounded-lg border border-line p-3 text-sm">
          <p>{{ n.body }}</p>
          <p class="mt-1 text-xs text-fg/40">{{ new Date(n.createdAt).toLocaleString('pl-PL') }}</p>
        </li>
        <li v-if="!data.notes.length" class="text-sm text-fg/50">Brak notatek.</li>
      </ul>
    </section>
  </main>
</template>
```

- [ ] **Step 7: Pełna suita + smoke (żywy Docker)**

Run: `npm test` → cała suita zielona.

Smoke (po `npm run dev` lokalnie u siebie): zaloguj się (`admin@witrynovo.pl`), przejdź enrollment 2FA, otwórz leada, zmień status, dodaj notatkę — sprawdź, że status i notatka utrwalają się po odświeżeniu.

- [ ] **Step 8: Commit**

```bash
git add server/api/admin/leads app/pages/admin/leads test/utils/note-validation.test.ts
git commit -m "feat(admin): szczegół leada — zmiana statusu + notatki"
```

---

## Self-Review (autora planu)

**Pokrycie specu:**
- §2 stack/sesja → Task 1 (moduł, sekret), Task 2 (`requireAdmin`/sesja). ✅
- §3 logowanie dwuetapowe + enrollment + recovery → Task 5 (login), Task 6 (2FA setup/verify), Task 4 (CLI reset). ✅
- §4 model danych (`users`, `lead_notes`) → Task 1. ✅
- §5 trasy/endpointy (auth + admin + warstwa wspólna + ochrona) → Tasks 5–8. ✅
- §6 bezpieczeństwo (argon2, atrapa-hash, throttling, sesja pending, brak rejestracji) → Tasks 2/5/6. ✅
- §7 testy (cores DI, utils, composable, smoke) → Tasks 2–8. ✅
- §8 CLI → Task 4. ✅

**Placeholdery:** brak „TBD/TODO" w krokach; każdy krok ma realny kod/komendę. ✅

**Spójność typów/nazw:** `AdminSession`, `LoginDeps`/`LoginResult`, `TotpDeps`/`TotpResult`, `parseLeadQuery`/`isValidStatus`/`validateNoteBody`, `User`/`LeadNote` — definiowane raz i konsumowane spójnie. Sesja `{ user, mfa }` używana jednolicie (login ustawia `mfa:false`, 2FA `mfa:true`, middleware i `requireAdmin` czytają `mfa`). ✅

**Uwagi wykonawcze (znane ryzyka):**
- Render komponentów/SSR (strony `/admin/*`, `useFetch`, middleware) **niepokryty automatem** — środowisko Nuxt-vitest się wiesza (dług z Warstwy 1). Weryfikacja przez ręczny smoke (Task 7/8) — endpointy i logika są pokryte jednostkowo.
- `DUMMY_HASH` (Task 2) musi być poprawnym formatem argon2id, by `verifyPassword` spalił czas zamiast natychmiast rzucić; jeśli okaże się niepoprawny, wygeneruj realny przez `argon2.hash('x')` i wstaw stałą. Funkcjonalnie i tak zwraca `false`.
- `nuxt-auth-utils` auto-importuje `setUserSession`/`getUserSession`/`clearUserSession`/`useUserSession` (server + client) — nie trzeba importów; wymaga tylko `NUXT_SESSION_PASSWORD`.
