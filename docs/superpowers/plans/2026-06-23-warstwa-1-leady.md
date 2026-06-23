# Warstwa 1 — przyjmowanie leadów — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Podłączyć formularz kontaktowy strony do realnego backendu — `POST /api/leads` waliduje, odsiewa spam, zapisuje leada do MySQL i wysyła powiadomienie e-mail; front pokazuje sukces/błąd i zbiera zgodę RODO.

**Architecture:** Jeden projekt Nuxt 4 z renderowaniem hybrydowym. Logika backendu żyje w `server/` jako Nitro server routes. Sednem są **czyste, testowalne funkcje** (walidacja Valibot, anty-spam, builder maila, rdzeń decyzyjny `handleLead`); endpoint Nitro i komponent Vue to cienkie adaptery wstrzykujące zależności (baza, transport maila, zegar). Baza: lokalny MySQL przez Docker, dostęp przez Drizzle ORM.

**Tech Stack:** Nuxt 4, Nitro (Node), TypeScript, Drizzle ORM + drizzle-kit, MySQL 8, Valibot, Nodemailer (dev → Mailpit), Vitest + @nuxt/test-utils, Docker Compose.

## Global Constraints

- Runtime **Node** (nie edge) — MySQL po TCP. Nuxt 4, TypeScript.
- Cały kod backendu w katalogu `server/` (Nuxt 4 trzyma `server/` w roocie projektu, obok `app/`).
- Copy widoczne dla użytkownika **po polsku**, ton właściciela lokalnej firmy, bez żargonu.
- Strony marketingowe pozostają **prerenderowane** — nie wolno pogorszyć SEO/wydajności landingu.
- W tej warstwie **brak** jakiegokolwiek logowania/auth (to Warstwa 2). Jedyna publiczna końcówka: `POST /api/leads`.
- Sekrety przez `.env` → `runtimeConfig`. `.env` i `.env.*` są już w `.gitignore` — **nigdy nie commituj `.env`**.
- Lista branż musi być identyczna na froncie i w walidacji serwera:
  `Barber`, `Fryzjer`, `Salon kosmetyczny`, `Mechanik`, `Kwiaciarnia`, `Restauracja / gastronomia`, `Siłownia / fitness`, `Inna`.
- Baza jest źródłem prawdy. Mail jest best-effort: błąd maila przy udanym zapisie = i tak sukces.

---

## Struktura plików (tworzona w tej warstwie)

| Plik | Odpowiedzialność |
|---|---|
| `docker-compose.yml` | MySQL 8 + Mailpit do dev |
| `.env.example` | wzór zmiennych środowiskowych |
| `drizzle.config.ts` | konfiguracja drizzle-kit (migracje) |
| `vitest.config.ts` | konfiguracja testów |
| `server/database/schema.ts` | schemat Drizzle — tabela `leads` |
| `server/database/client.ts` | pula połączeń + instancja Drizzle (`useDb`) |
| `server/database/migrations/*` | wygenerowane migracje SQL |
| `server/utils/validation.ts` | schema Valibot + `parseLead`, `isEmail`, `isPhone` |
| `server/utils/antispam.ts` | honeypot, time-trap, rate-limit |
| `server/utils/mail.ts` | `buildLeadEmail` (czysty) + `sendLeadNotification` (wiring) |
| `server/utils/handle-lead.ts` | rdzeń decyzyjny `handleLead(input, deps)` |
| `server/api/leads.post.ts` | cienki adapter Nitro |
| `app/pages/polityka-prywatnosci.vue` | strona polityki prywatności |
| `app/components/sections/CtaSection.vue` | **modyfikacja** — realny submit, honeypot, ts, zgoda |
| `test/**` | testy jednostkowe i komponentu |

---

## Task 1: Fundament — zależności, Docker, Drizzle, schemat `leads`, migracja

Scaffolding całej warstwy: instalacja zależności, baza w Dockerze, konfiguracja Drizzle, schemat tabeli `leads`, pierwsza migracja, `runtimeConfig` i tryb hybrydowy w Nuxt. Deliverable: zmigrowana tabela `leads` osiągalna z testu.

**Files:**
- Create: `docker-compose.yml`, `.env.example`, `drizzle.config.ts`, `vitest.config.ts`
- Create: `server/database/schema.ts`, `server/database/client.ts`
- Modify: `package.json` (zależności + skrypty), `nuxt.config.ts` (`runtimeConfig`, `routeRules`)
- Test: `test/db/leads-table.test.ts`

**Interfaces:**
- Produces: `leads` (drizzle table), typy `Lead` / `NewLead`, stała `LEAD_STATUSES`, funkcja `useDb()` zwracająca instancję Drizzle z `{ schema }`.

- [ ] **Step 1: Zainstaluj zależności**

```bash
npm i drizzle-orm mysql2 valibot nodemailer
npm i -D drizzle-kit @types/nodemailer vitest @nuxt/test-utils @vue/test-utils happy-dom dotenv
```

- [ ] **Step 2: Dodaj skrypty do `package.json`**

W sekcji `"scripts"` dopisz:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Utwórz `docker-compose.yml`**

```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: witrynovo
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
  mailpit:
    image: axllent/mailpit
    ports:
      - '1025:1025'
      - '8025:8025'
volumes:
  mysql_data:
```

- [ ] **Step 4: Utwórz `.env.example` i lokalny `.env`**

`.env.example`:

```bash
NUXT_DATABASE_URL=mysql://root:root@localhost:3306/witrynovo
NUXT_LEAD_NOTIFY_TO=kontakt@witrynovo.pl
NUXT_SMTP_HOST=localhost
NUXT_SMTP_PORT=1025
NUXT_SMTP_FROM=witrynovo <no-reply@witrynovo.pl>
```

Skopiuj do lokalnego `.env` (nie commitowany): `cp .env.example .env`

- [ ] **Step 5: Utwórz `drizzle.config.ts`**

```ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'mysql',
  dbCredentials: { url: process.env.NUXT_DATABASE_URL! },
})
```

- [ ] **Step 6: Utwórz `server/database/schema.ts`**

```ts
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
```

- [ ] **Step 7: Utwórz `server/database/client.ts`**

```ts
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db
  const { databaseUrl } = useRuntimeConfig()
  const pool = mysql.createPool(databaseUrl)
  _db = drizzle(pool, { schema, mode: 'default' })
  return _db
}
```

- [ ] **Step 8: Dodaj `runtimeConfig` i `routeRules` w `nuxt.config.ts`**

W obiekcie `defineNuxtConfig({ ... })` dopisz (obok istniejących kluczy, np. po `modules`):

```ts
  runtimeConfig: {
    databaseUrl: '',
    leadNotifyTo: '',
    smtp: { host: '', port: '', from: '' },
  },

  routeRules: {
    '/': { prerender: true },
    '/polityka-prywatnosci': { prerender: true },
  },
```

(Mapowanie env: `NUXT_DATABASE_URL`→`databaseUrl`, `NUXT_LEAD_NOTIFY_TO`→`leadNotifyTo`, `NUXT_SMTP_HOST`→`smtp.host`, `NUXT_SMTP_PORT`→`smtp.port`, `NUXT_SMTP_FROM`→`smtp.from`.)

- [ ] **Step 9: Utwórz `vitest.config.ts`**

```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config'],
  },
})
```

- [ ] **Step 10: Wygeneruj migrację**

Run: `npm run db:generate`
Expected: powstaje plik w `server/database/migrations/0000_*.sql` z `CREATE TABLE \`leads\``.

- [ ] **Step 11: Wstań Docker i zastosuj migrację**

```bash
docker compose up -d
npm run db:migrate
```
Expected: migracja zastosowana bez błędu; tabela `leads` istnieje w bazie `witrynovo`.

- [ ] **Step 12: Napisz failujący test tabeli**

`test/db/leads-table.test.ts`:

```ts
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
```

- [ ] **Step 13: Uruchom test**

Run: `npm test -- test/db/leads-table.test.ts`
Expected: PASS (jeśli FAIL „Table doesn't exist" — wróć do Step 11).

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json docker-compose.yml .env.example \
  drizzle.config.ts vitest.config.ts nuxt.config.ts server/database test/db
git commit -m "feat(backend): fundament — MySQL, Drizzle, schemat leads, migracja"
```

---

## Task 2: Walidacja leada (Valibot)

Czysta funkcja walidująca wejście formularza. Bez Nuxt, bez bazy — w pełni jednostkowo testowalna.

**Files:**
- Create: `server/utils/validation.ts`
- Test: `test/utils/validation.test.ts`

**Interfaces:**
- Produces:
  - `BRANZE: readonly string[]`
  - `isEmail(s: string): boolean`, `isPhone(s: string): boolean`
  - `LeadInput` (typ wyjściowy schemy)
  - `parseLead(input: unknown): { ok: true; data: LeadInput } | { ok: false; errors: Record<string, string> }`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseLead, isEmail, isPhone } from '../../server/utils/validation'

describe('isEmail / isPhone', () => {
  it('rozpoznaje e-mail', () => {
    expect(isEmail('jan@firma.pl')).toBe(true)
    expect(isEmail('jan(at)firma')).toBe(false)
  })
  it('rozpoznaje telefon', () => {
    expect(isPhone('+48 600 700 800')).toBe(true)
    expect(isPhone('123')).toBe(false)
  })
})

describe('parseLead', () => {
  const ok = { imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber' }

  it('przyjmuje poprawnego leada', () => {
    const r = parseLead(ok)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.imie).toBe('Jan')
  })

  it('odrzuca brak imienia', () => {
    const r = parseLead({ ...ok, imie: '   ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.imie).toBeTruthy()
  })

  it('odrzuca kontakt, który nie jest ani telefonem, ani e-mailem', () => {
    const r = parseLead({ ...ok, kontakt: 'zadzwoń do mnie' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.kontakt).toBeTruthy()
  })

  it('odrzuca branżę spoza listy', () => {
    const r = parseLead({ ...ok, branza: 'Kowboj' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.branza).toBeTruthy()
  })

  it('akceptuje telefon jako kontakt i puste pola opcjonalne', () => {
    const r = parseLead({ ...ok, kontakt: '600700800', firma: '', wiadomosc: '' })
    expect(r.ok).toBe(true)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/validation.test.ts`
Expected: FAIL („Cannot find module .../validation").

- [ ] **Step 3: Zaimplementuj `server/utils/validation.ts`**

```ts
import * as v from 'valibot'

export const BRANZE = [
  'Barber', 'Fryzjer', 'Salon kosmetyczny', 'Mechanik',
  'Kwiaciarnia', 'Restauracja / gastronomia', 'Siłownia / fitness', 'Inna',
] as const

export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export function isPhone(s: string): boolean {
  const digits = s.replace(/[\s\-()]/g, '')
  return /^\+?\d{9,15}$/.test(digits)
}

const optionalTrimmed = v.optional(
  v.pipe(v.string(), v.trim()),
  '',
)

export const LeadSchema = v.object({
  imie: v.pipe(v.string(), v.trim(), v.minLength(1, 'Podaj imię')),
  kontakt: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Podaj telefon lub e-mail'),
    v.check((s) => isEmail(s) || isPhone(s), 'Podaj poprawny telefon lub e-mail'),
  ),
  branza: v.picklist(BRANZE, 'Wybierz branżę'),
  firma: optionalTrimmed,
  wiadomosc: optionalTrimmed,
})

export type LeadInput = v.InferOutput<typeof LeadSchema>

export function parseLead(
  input: unknown,
): { ok: true; data: LeadInput } | { ok: false; errors: Record<string, string> } {
  const result = v.safeParse(LeadSchema, input)
  if (result.success) return { ok: true, data: result.output }

  const errors: Record<string, string> = {}
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key
    if (typeof key === 'string' && !errors[key]) errors[key] = issue.message
  }
  return { ok: false, errors }
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/validation.test.ts`
Expected: PASS (wszystkie testy).

- [ ] **Step 5: Commit**

```bash
git add server/utils/validation.ts test/utils/validation.test.ts
git commit -m "feat(backend): walidacja leada (Valibot)"
```

---

## Task 3: Anty-spam (honeypot, time-trap, rate-limit)

Trzy czyste funkcje obronne. Bez Nuxt — jednostkowo testowalne, z wstrzykiwanym czasem.

**Files:**
- Create: `server/utils/antispam.ts`
- Test: `test/utils/antispam.test.ts`

**Interfaces:**
- Produces:
  - `isHoneypotTripped(payload: { website?: unknown }): boolean`
  - `isTooFast(renderedAt: unknown, now: number, minMs?: number): boolean`
  - `rateLimit(ip: string, now: number, limit?: number, windowMs?: number): boolean` — `true` = w limicie (OK), `false` = przekroczono
  - `_resetRateLimit(): void` — helper testowy

- [ ] **Step 1: Napisz failujące testy**

`test/utils/antispam.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  isHoneypotTripped, isTooFast, rateLimit, _resetRateLimit,
} from '../../server/utils/antispam'

describe('isHoneypotTripped', () => {
  it('false gdy pole puste/niewypełnione', () => {
    expect(isHoneypotTripped({})).toBe(false)
    expect(isHoneypotTripped({ website: '' })).toBe(false)
  })
  it('true gdy bot wypełnił honeypot', () => {
    expect(isHoneypotTripped({ website: 'http://spam' })).toBe(true)
  })
})

describe('isTooFast', () => {
  const now = 1_000_000
  it('true gdy zgłoszenie szybsze niż 2s', () => {
    expect(isTooFast(now - 500, now)).toBe(true)
  })
  it('false gdy minęło wystarczająco', () => {
    expect(isTooFast(now - 5000, now)).toBe(false)
  })
  it('true gdy brak/niepoprawny znacznik', () => {
    expect(isTooFast(undefined, now)).toBe(true)
    expect(isTooFast('abc', now)).toBe(true)
  })
  it('false przy ujemnym elapsed (rozjazd zegara) — nie karzemy', () => {
    expect(isTooFast(now + 5000, now)).toBe(false)
  })
})

describe('rateLimit', () => {
  beforeEach(() => _resetRateLimit())
  it('przepuszcza do limitu, potem blokuje', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) expect(rateLimit('1.1.1.1', now)).toBe(true)
    expect(rateLimit('1.1.1.1', now)).toBe(false)
  })
  it('różne IP mają osobne liczniki', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) rateLimit('1.1.1.1', now)
    expect(rateLimit('2.2.2.2', now)).toBe(true)
  })
  it('okno wygasa po czasie', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) rateLimit('1.1.1.1', now)
    expect(rateLimit('1.1.1.1', now + 61_000)).toBe(true)
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/antispam.test.ts`
Expected: FAIL („Cannot find module .../antispam").

- [ ] **Step 3: Zaimplementuj `server/utils/antispam.ts`**

```ts
export function isHoneypotTripped(payload: { website?: unknown }): boolean {
  return typeof payload.website === 'string' && payload.website.trim().length > 0
}

export function isTooFast(renderedAt: unknown, now: number, minMs = 2000): boolean {
  const t = Number(renderedAt)
  if (!Number.isFinite(t)) return true
  const elapsed = now - t
  if (elapsed < 0) return false // rozjazd zegara — nie karzemy
  return elapsed < minMs
}

const hits = new Map<string, number[]>()

export function rateLimit(
  ip: string,
  now: number,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length <= limit
}

export function _resetRateLimit(): void {
  hits.clear()
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/antispam.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/antispam.ts test/utils/antispam.test.ts
git commit -m "feat(backend): anty-spam (honeypot, time-trap, rate-limit)"
```

---

## Task 4: Mail — builder treści + wysyłka

`buildLeadEmail` to czysta funkcja składająca wiadomość (testowana jednostkowo). `sendLeadNotification` to cienki wiring (Nodemailer + `runtimeConfig`), nie testowany jednostkowo — pokryje go ręczny smoke (Task 6) przez Mailpit.

**Files:**
- Create: `server/utils/mail.ts`
- Test: `test/utils/mail.test.ts`

**Interfaces:**
- Consumes: `LeadInput` z `server/utils/validation.ts`
- Produces:
  - `buildLeadEmail(lead: LeadInput, opts: { to: string; from: string }): { from: string; to: string; subject: string; text: string }`
  - `sendLeadNotification(lead: LeadInput): Promise<void>`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/mail.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildLeadEmail } from '../../server/utils/mail'
import type { LeadInput } from '../../server/utils/validation'

const lead: LeadInput = {
  imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber',
  firma: 'Razor Sznyt', wiadomosc: 'mam logo',
}

describe('buildLeadEmail', () => {
  it('ustawia to/from i temat z imieniem i branżą', () => {
    const msg = buildLeadEmail(lead, { to: 'kontakt@witrynovo.pl', from: 'no-reply@witrynovo.pl' })
    expect(msg.to).toBe('kontakt@witrynovo.pl')
    expect(msg.from).toBe('no-reply@witrynovo.pl')
    expect(msg.subject).toContain('Jan')
    expect(msg.subject).toContain('Barber')
  })

  it('treść zawiera wszystkie wypełnione pola', () => {
    const { text } = buildLeadEmail(lead, { to: 'a@b.pl', from: 'c@d.pl' })
    expect(text).toContain('jan@firma.pl')
    expect(text).toContain('Razor Sznyt')
    expect(text).toContain('mam logo')
  })

  it('pomija puste pola opcjonalne', () => {
    const { text } = buildLeadEmail(
      { imie: 'Ala', kontakt: '600700800', branza: 'Inna', firma: '', wiadomosc: '' },
      { to: 'a@b.pl', from: 'c@d.pl' },
    )
    expect(text).not.toContain('Firma:')
    expect(text).not.toContain('Wiadomość:')
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/mail.test.ts`
Expected: FAIL („Cannot find module .../mail").

- [ ] **Step 3: Zaimplementuj `server/utils/mail.ts`**

```ts
import nodemailer, { type Transporter } from 'nodemailer'
import type { LeadInput } from './validation'

export function buildLeadEmail(
  lead: LeadInput,
  opts: { to: string; from: string },
): { from: string; to: string; subject: string; text: string } {
  const text = [
    `Imię: ${lead.imie}`,
    `Kontakt: ${lead.kontakt}`,
    `Branża: ${lead.branza}`,
    lead.firma ? `Firma: ${lead.firma}` : null,
    lead.wiadomosc ? `Wiadomość: ${lead.wiadomosc}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    from: opts.from,
    to: opts.to,
    subject: `Nowy lead: ${lead.imie} (${lead.branza})`,
    text,
  }
}

let _transport: Transporter | null = null

function getTransport(): Transporter {
  if (_transport) return _transport
  const { smtp } = useRuntimeConfig()
  _transport = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    secure: false,
  })
  return _transport
}

export async function sendLeadNotification(lead: LeadInput): Promise<void> {
  const cfg = useRuntimeConfig()
  const msg = buildLeadEmail(lead, { to: cfg.leadNotifyTo, from: cfg.smtp.from })
  await getTransport().sendMail(msg)
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/mail.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/mail.ts test/utils/mail.test.ts
git commit -m "feat(backend): builder i wysyłka powiadomienia o leadzie"
```

---

## Task 5: Rdzeń `handleLead` + endpoint `POST /api/leads`

`handleLead(input, deps)` to czysty rdzeń decyzyjny z wstrzykiwanymi zależnościami (baza, mail, zegar, IP, rate-limit) — w pełni jednostkowo testowalny. `leads.post.ts` to cienki adapter Nitro, który wstrzykuje realne zależności.

**Files:**
- Create: `server/utils/handle-lead.ts`, `server/api/leads.post.ts`
- Test: `test/utils/handle-lead.test.ts`

**Interfaces:**
- Consumes: `parseLead`/`LeadInput` (Task 2), `isHoneypotTripped`/`isTooFast` (Task 3), `useDb`+`leads` (Task 1), `sendLeadNotification`+`rateLimit` (Tasks 3–4)
- Produces:
  - `LeadDeps` — `{ now: number; ip: string; rateLimit: (ip: string, now: number) => boolean; insertLead: (data: LeadInput) => Promise<void>; sendMail: (lead: LeadInput) => Promise<void> }`
  - `LeadResult` — `{ status: 200|422|429|500; body: { ok: boolean; errors?: Record<string,string> } }`
  - `handleLead(input: unknown, deps: LeadDeps): Promise<LeadResult>`

- [ ] **Step 1: Napisz failujące testy**

`test/utils/handle-lead.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { handleLead, type LeadDeps } from '../../server/utils/handle-lead'

const now = 1_000_000
const validBody = {
  imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber',
  ts: now - 5000, website: '',
}

function deps(over: Partial<LeadDeps> = {}): LeadDeps {
  return {
    now,
    ip: '1.1.1.1',
    rateLimit: () => true,
    insertLead: vi.fn(async () => {}),
    sendMail: vi.fn(async () => {}),
    ...over,
  }
}

describe('handleLead', () => {
  it('poprawny lead → 200, zapis i mail wywołane', async () => {
    const d = deps()
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).toHaveBeenCalledOnce()
    expect(d.sendMail).toHaveBeenCalledOnce()
  })

  it('honeypot → 200, brak zapisu (cichy sukces)', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, website: 'spam' }, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('za szybkie zgłoszenie → 200, brak zapisu', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, ts: now - 100 }, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('przekroczony rate-limit → 429', async () => {
    const d = deps({ rateLimit: () => false })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(429)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('zły input → 422 z błędami pól', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, imie: '' }, d)
    expect(r.status).toBe(422)
    expect(r.body.errors?.imie).toBeTruthy()
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('błąd zapisu → 500, mail nie wysłany', async () => {
    const d = deps({ insertLead: vi.fn(async () => { throw new Error('db down') }) })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(500)
    expect(d.sendMail).not.toHaveBeenCalled()
  })

  it('błąd maila przy udanym zapisie → nadal 200', async () => {
    const d = deps({ sendMail: vi.fn(async () => { throw new Error('smtp down') }) })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Uruchom — ma faliować**

Run: `npm test -- test/utils/handle-lead.test.ts`
Expected: FAIL („Cannot find module .../handle-lead").

- [ ] **Step 3: Zaimplementuj `server/utils/handle-lead.ts`**

```ts
import { parseLead, type LeadInput } from './validation'
import { isHoneypotTripped, isTooFast } from './antispam'

export interface LeadDeps {
  now: number
  ip: string
  rateLimit: (ip: string, now: number) => boolean
  insertLead: (data: LeadInput) => Promise<void>
  sendMail: (lead: LeadInput) => Promise<void>
}

export interface LeadResult {
  status: 200 | 422 | 429 | 500
  body: { ok: boolean; errors?: Record<string, string> }
}

export async function handleLead(input: unknown, deps: LeadDeps): Promise<LeadResult> {
  const payload = (input ?? {}) as { website?: unknown; ts?: unknown }

  // Boty: cichy sukces — nie zdradzamy mechanizmu.
  if (isHoneypotTripped(payload) || isTooFast(payload.ts, deps.now)) {
    return { status: 200, body: { ok: true } }
  }

  if (!deps.rateLimit(deps.ip, deps.now)) {
    return { status: 429, body: { ok: false } }
  }

  const parsed = parseLead(input)
  if (!parsed.ok) {
    return { status: 422, body: { ok: false, errors: parsed.errors } }
  }

  try {
    await deps.insertLead(parsed.data)
  } catch (err) {
    console.error('[leads] zapis do bazy nieudany', err)
    return { status: 500, body: { ok: false } }
  }

  try {
    await deps.sendMail(parsed.data)
  } catch (err) {
    console.error('[leads] mail nieudany (lead zapisany)', err)
  }

  return { status: 200, body: { ok: true } }
}
```

- [ ] **Step 4: Uruchom — ma przejść**

Run: `npm test -- test/utils/handle-lead.test.ts`
Expected: PASS (wszystkie 7 przypadków).

- [ ] **Step 5: Zaimplementuj adapter `server/api/leads.post.ts`**

```ts
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
```

- [ ] **Step 6: Smoke endpointu (ręcznie)**

Upewnij się, że działa Docker (`docker compose up -d`) i serwer dev (`npm run dev`), potem:

```bash
curl -s -X POST http://localhost:3000/api/leads \
  -H 'content-type: application/json' \
  -d '{"imie":"Jan","kontakt":"jan@firma.pl","branza":"Barber","ts":0}'
```
Expected: `{"ok":true}`; w bazie pojawia się wiersz; w Mailpit (http://localhost:8025) widać maila.
(`"ts":0` przechodzi time-trap, bo `now - 0` >> 2s.)

- [ ] **Step 7: Commit**

```bash
git add server/utils/handle-lead.ts server/api/leads.post.ts test/utils/handle-lead.test.ts
git commit -m "feat(backend): rdzeń handleLead + endpoint POST /api/leads"
```

---

## Task 6: Front — podłączenie formularza, honeypot, zgoda RODO, strona polityki

Podmiana `// TODO` w `CtaSection.vue` na realny `fetch`, dodanie honeypotu, znacznika czasu, checkboxa zgody i linku do polityki prywatności. Plus prerenderowana strona polityki.

**Files:**
- Modify: `app/components/sections/CtaSection.vue`
- Create: `app/pages/polityka-prywatnosci.vue`
- Test: `test/components/cta-section.nuxt.test.ts`

**Interfaces:**
- Consumes: endpoint `POST /api/leads` (Task 5), zwraca `{ ok: true }` lub przy `422` `{ ok: false, errors }`.

- [ ] **Step 1: Utwórz stronę polityki prywatności**

`app/pages/polityka-prywatnosci.vue`:

```vue
<script setup lang="ts">
useHead({ title: 'Polityka prywatności - witrynovo.pl' })
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-24 text-fg">
    <h1 class="display text-3xl md:text-4xl">Polityka prywatności</h1>
    <div class="mt-8 space-y-4 text-fg/80">
      <p>
        Administratorem danych podanych w formularzu jest witrynovo.pl. Dane
        (imię, telefon lub e-mail, branża, nazwa firmy oraz treść wiadomości)
        przetwarzamy wyłącznie w celu przygotowania darmowego projektu strony
        i kontaktu w tej sprawie.
      </p>
      <p>
        Danych nie przekazujemy podmiotom trzecim w celach marketingowych.
        Masz prawo wglądu, poprawienia oraz usunięcia swoich danych - napisz na
        <a href="mailto:kontakt@witrynovo.pl" class="text-brand-2 underline">kontakt@witrynovo.pl</a>.
      </p>
      <p>
        Dane przechowujemy tak długo, jak to potrzebne do obsługi zgłoszenia,
        a następnie je usuwamy.
      </p>
    </div>
    <NuxtLink to="/" class="mt-10 inline-block text-sm text-brand-2 underline">
      &larr; Wróć na stronę główną
    </NuxtLink>
  </main>
</template>
```

- [ ] **Step 2: Napisz failujący test komponentu**

`test/components/cta-section.nuxt.test.ts`:

```ts
// @vitest-environment nuxt
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import CtaSection from '../../app/components/sections/CtaSection.vue'

// useReveal sięga do GSAP/DOM — w teście nie jest potrzebny.
vi.mock('~/composables/useReveal', () => ({ useReveal: () => {} }))

let received: any = null
beforeEach(() => {
  received = null
  registerEndpoint('/api/leads', {
    method: 'POST',
    handler: async (event) => {
      const { readBody } = await import('h3')
      received = await readBody(event)
      return { ok: true }
    },
  })
})

describe('CtaSection', () => {
  it('wysyła leada i pokazuje ekran sukcesu', async () => {
    const wrapper = await mountSuspended(CtaSection)

    await wrapper.find('#f-imie').setValue('Jan')
    await wrapper.find('#f-kontakt').setValue('jan@firma.pl')
    await wrapper.find('#f-branza').setValue('Barber')
    await wrapper.find('#f-zgoda').setValue(true)

    await wrapper.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    expect(received).toMatchObject({ imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber' })
    expect(wrapper.text()).toContain('Dziękujemy')
  })

  it('nie wysyła bez zgody', async () => {
    const wrapper = await mountSuspended(CtaSection)
    await wrapper.find('#f-imie').setValue('Jan')
    await wrapper.find('#f-kontakt').setValue('jan@firma.pl')
    await wrapper.find('#f-branza').setValue('Barber')
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise((r) => setTimeout(r, 0))
    expect(received).toBeNull()
  })
})
```

- [ ] **Step 3: Uruchom — ma faliować**

Run: `npm test -- test/components/cta-section.nuxt.test.ts`
Expected: FAIL (brak pola `#f-zgoda` / brak realnego submita).

- [ ] **Step 4: Zaktualizuj `<script setup>` w `CtaSection.vue`**

Zamień obiekt `form`, `valid` i funkcję `submit` (zachowaj `root`/`useReveal`, `branze`, `reassurances`, `inputClass`). Dodaj `website`, `zgoda`, `renderedAt`, stany sieci i błędy serwera:

```ts
const form = reactive({
  imie: '',
  kontakt: '',
  branza: '',
  firma: '',
  wiadomosc: '',
  zgoda: false,
  website: '', // honeypot — ukryte, ludzie nie wypełniają
})
const submitted = ref(false)
const tried = ref(false)
const submitting = ref(false)
const submitError = ref('')
const serverErrors = reactive<Record<string, string>>({})

const renderedAt = ref(0)
onMounted(() => {
  renderedAt.value = Date.now()
})

const valid = computed(
  () => form.imie.trim() && form.kontakt.trim() && form.branza && form.zgoda,
)

async function submit() {
  tried.value = true
  submitError.value = ''
  Object.keys(serverErrors).forEach((k) => delete serverErrors[k])
  if (!valid.value) return
  submitting.value = true
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        imie: form.imie,
        kontakt: form.kontakt,
        branza: form.branza,
        firma: form.firma,
        wiadomosc: form.wiadomosc,
        website: form.website,
        ts: renderedAt.value,
      },
    })
    submitted.value = true
  } catch (e: any) {
    if (e?.statusCode === 422 && e?.data?.errors) {
      Object.assign(serverErrors, e.data.errors)
    } else {
      submitError.value = 'Coś poszło nie tak. Spróbuj ponownie lub zadzwoń.'
    }
  } finally {
    submitting.value = false
  }
}
```

- [ ] **Step 5: Dodaj honeypot, zgodę i komunikat błędu w `<template>`**

W `<form ...>` (Task wcześniej widziany), **przed** przyciskiem submit dodaj honeypot i checkbox zgody:

```vue
              <!-- honeypot: ukryte przed ludźmi, łapie boty -->
              <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label>Strona WWW
                  <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
                </label>
              </div>

              <label class="flex items-start gap-2.5 text-xs text-panel-fg/70">
                <input
                  id="f-zgoda"
                  v-model="form.zgoda"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                />
                <span>
                  Wyrażam zgodę na przetwarzanie moich danych w celu kontaktu i przygotowania
                  projektu. Szczegóły w
                  <NuxtLink to="/polityka-prywatnosci" class="text-brand-4 underline">polityce prywatności</NuxtLink>.
                </span>
              </label>
```

Zmień przycisk submit, by blokował się w trakcie wysyłki:

```vue
              <button
                type="submit"
                data-cursor="hover"
                :disabled="submitting"
                class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {{ submitting ? 'Wysyłam...' : 'Odbieram darmowy projekt' }}
              </button>
```

Zaktualizuj komunikat pod przyciskiem, by uwzględniał zgodę i błąd serwera (zamień istniejący blok `<p v-if="tried && !valid">...`):

```vue
              <p v-if="submitError" class="text-center text-xs text-red-400">
                {{ submitError }}
              </p>
              <p v-else-if="tried && !valid" class="text-center text-xs text-red-400">
                Uzupełnij imię, kontakt, branżę i zaznacz zgodę.
              </p>
              <p v-else class="text-center text-xs text-panel-fg/50">
                Odpowiadamy w 24h · Twoje dane trafią tylko do nas
              </p>
```

- [ ] **Step 6: Uruchom test komponentu — ma przejść**

Run: `npm test -- test/components/cta-section.nuxt.test.ts`
Expected: PASS (oba przypadki).

- [ ] **Step 7: Pełny smoke w przeglądarce**

Z działającym Dockerem i `npm run dev`: wejdź na `http://localhost:3000`, wypełnij formularz, zaznacz zgodę, wyślij. Sprawdź: ekran „Dziękujemy", wiersz w bazie, mail w Mailpit (http://localhost:8025), działający link `/polityka-prywatnosci`.

- [ ] **Step 8: Pełny zestaw testów**

Run: `npm test`
Expected: PASS — wszystkie pliki (db, utils, handle-lead, komponent).

- [ ] **Step 9: Commit**

```bash
git add app/components/sections/CtaSection.vue app/pages/polityka-prywatnosci.vue \
  test/components/cta-section.nuxt.test.ts
git commit -m "feat(front): realna wysyłka formularza, zgoda RODO, polityka prywatności"
```

---

## Aktualizacja dokumentacji (po Task 6)

- [ ] W `docs/USTALENIA.md` §10 odhacz „Realna wysyłka formularza" i „Polityka prywatności"; w §11 zaznacz, że honeypot/ts są dodane. Commit: `docs: aktualizacja USTALENIA po Warstwie 1`.

---

## Self-Review (autora planu)

**Pokrycie specu (sekcja 5 specu):**
- 5.1 endpoint + walidacja Valibot → Task 2 (walidacja) + Task 5 (endpoint). ✅
- 5.2 anty-spam (honeypot, time-trap, rate-limit) → Task 3 + użycie w Task 5. ✅
- 5.3 zapis (Drizzle, status='new', source) → Task 1 (schemat) + Task 5 (insert). ✅
- 5.4 mail best-effort → Task 4 + reguła w Task 5 (błąd maila ⇒ 200). ✅
- 5.5 front: fetch, ekran sukcesu, zgoda+polityka → Task 6. ✅
- 5.6 setup lokalny (Docker MySQL+Mailpit, .env, migracje) → Task 1. ✅
- Sekcja 6 (obsługa błędów: 422/429/500/200) → testy w Task 5. ✅
- Sekcja 8 (testy TDD jednostkowe + integracyjne) → Tasks 2–6. ✅

**Placeholdery:** brak „TBD/TODO" w krokach; każdy krok ma realny kod/komendę. ✅

**Spójność typów:** `LeadInput` (Task 2) używany w Tasks 4–5; `parseLead` zwraca `{ok,data}|{ok,errors}` spójnie konsumowany w `handleLead`; `LeadDeps`/`LeadResult` zdefiniowane w Task 5 i tam użyte; nazwy pól (`imie/kontakt/branza/firma/wiadomosc`) zgodne między schematem, walidacją, mailem i frontem. ✅

**Poza zakresem (świadomie):** brak auth/2FA/panelu/klientów — to Warstwy 2–3.
