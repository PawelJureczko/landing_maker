# Warstwa 2 — panel admina z 2FA — design

> Spec drugiej warstwy CRM witrynovo.pl: logowanie z obowiązkowym 2FA (TOTP)
> i panel `/admin` do obsługi leadów.
> Data: **2026-06-24**. Bazuje na: [`docs/superpowers/specs/2026-06-23-backend-crm-design.md`](2026-06-23-backend-crm-design.md).
> Warstwa 1 (przyjmowanie leadów) jest ukończona i zmergowana.

---

## 1. Cel i zakres

Wewnętrzny panel `/admin` dla właścicieli witrynovo.pl — za **obowiązkowym
logowaniem dwuetapowym (hasło + TOTP)**. Pozwala obsłużyć napływające leady:
przeglądać, zmieniać status w pipeline i dopisywać notatki.

**W zakresie:**
- logowanie: email + hasło (`argon2`) → TOTP (obowiązkowe),
- enrollment 2FA przy pierwszym logowaniu (QR), recovery przez CLI,
- panel: lista leadów + filtr/szukajka, szczegół leada, zmiana statusu,
  historia notatek,
- konta zakładane ręcznie przez CLI.

**Poza zakresem (świadomie, YAGNI):**
- publiczna rejestracja, reset hasła przez e-mail, portal klienta,
- kody zapasowe 2FA (recovery = reset przez CLI),
- role/uprawnienia (wszyscy zalogowani mają pełny dostęp — 1–3 osoby),
- klienci / projekty / abonamenty (Warstwa 3).

### Kto się loguje

Wyłącznie zespół (1–3 konta). Leady to dane, nie użytkownicy. Jedyne publiczne
końcówki pozostają z Warstwy 1 (`POST /api/leads`) plus strony logowania
(`/admin/login`, `/admin/2fa`); cała reszta panelu za sesją `mfa:true`.

---

## 2. Stack i architektura auth

Kontynuacja stacku z Warstwy 1 (Nuxt 4 + Nitro, Drizzle + MySQL). Dodatki:

| Element | Wybór | Po co |
|---|---|---|
| Sesja | **`nuxt-auth-utils`** | sealed cookie (szyfrowana + podpisana), gotowe `setUserSession`/`requireUserSession`/`clearUserSession` |
| Hasła | **`argon2`** (argon2id) | hash haseł zespołu |
| TOTP | **`otpauth`** | generacja sekretu + weryfikacja kodu |
| QR | **`qrcode`** | render `otpauth://` do obrazka przy enrollmencie |
| CLI | **`tsx`** (devDep) | uruchamianie skryptów TS z reuse schematu Drizzle |

**Sesja** przechowuje `{ user: { id, email }, mfa: boolean }`:
- po kroku 1 (hasło OK) → sesja **pending** (`mfa:false`) — brak wstępu do panelu,
- po kroku 2 (TOTP OK) → `mfa:true` — pełny dostęp.

**Konfiguracja:** `NUXT_SESSION_PASSWORD` (≥32 znaki) w `.env` → `runtimeConfig`.

---

## 3. Logowanie dwuetapowe i 2FA

**Krok 1 — email + hasło:**
- weryfikacja `argon2`. Przy nieznanym emailu wykonujemy weryfikację wobec
  atrapy-hasha (brak enumeracji userów przez timing).
- komunikat zawsze ogólny: „zły email lub hasło".
- sukces → sesja pending; odpowiedź wskazuje następny krok: `enroll`
  (gdy `totp_enabled=false`) lub `verify` (gdy `true`).

**Krok 2 — TOTP:**
- **enrollment** (`totp_enabled=false`): `POST /2fa/setup` generuje `totp_secret`
  + `otpauth://` URL; strona pokazuje QR + sekret. Po wpisaniu poprawnego kodu
  (`/2fa/verify`) zapisujemy `totp_secret`, ustawiamy `totp_enabled=true`,
  sesja `mfa:true`.
- **verify** (`totp_enabled=true`): `POST /2fa/verify` sprawdza kod wobec
  zapisanego sekretu; OK → sesja `mfa:true`.
- TOTP: okno 30 s, tolerancja ±1 krok (rozjazd zegara).

**Recovery (CLI):** `user:reset-2fa <email>` czyści `totp_secret`/`totp_enabled`
→ przy następnym logowaniu enrollment od nowa.

---

## 4. Model danych (dodatki)

Dokładamy dwie tabele; `leads` bez zmian (kolumna `status` z enumem już istnieje
— w tej warstwie tylko aktualizowana).

### `users`

| Kolumna | Typ | Uwagi |
|---|---|---|
| `id` | int autoincrement PK | |
| `email` | varchar(200), **unique**, notNull | login |
| `password_hash` | varchar(255), notNull | `argon2` |
| `totp_secret` | varchar(255), **nullable** | ustawiany przy enrollmencie |
| `totp_enabled` | boolean, notNull, default `false` | brama 1. logowania |
| `created_at` | timestamp, default now | |

### `lead_notes`

| Kolumna | Typ | Uwagi |
|---|---|---|
| `id` | int autoincrement PK | |
| `lead_id` | int, notNull, **FK → leads.id** | `ON DELETE CASCADE` |
| `author_id` | int, notNull, **FK → users.id** | kto dopisał |
| `body` | text, notNull | treść notatki |
| `created_at` | timestamp, default now | sortowanie chronologiczne |

**Migracja:** `npm run db:generate` tworzy `0001_*` dodającą obie tabele z FK;
dane `leads` nietknięte.

**Eksporty schematu:** `users`, `leadNotes`, typy `User`/`NewUser`,
`LeadNote`/`NewLeadNote`.

---

## 5. Trasy i endpointy

### Strony (`app/pages/admin/`, layout `admin` — minimalny, bez marketingowego nav/kursora/aurory)

| Trasa | Rola | Dostęp |
|---|---|---|
| `/admin/login` | krok 1: email + hasło | publiczna |
| `/admin/2fa` | krok 2: enrollment (QR) albo „podaj kod" | sesja pending |
| `/admin` | lista leadów + filtr (status/branża) + szukajka | `mfa:true` |
| `/admin/leads/[id]` | szczegół: pola, zmiana statusu, notatki + dodanie | `mfa:true` |

### Endpointy auth (`server/api/auth/`)

- `POST /login` — email+hasło → sesja pending + następny krok.
- `POST /2fa/setup` — generuje sekret + `otpauth://` URL (wymaga sesji pending).
- `POST /2fa/verify` — weryfikuje kod; enrollment zapisuje sekret + `enabled`;
  ustawia `mfa:true`.
- `POST /logout` — czyści sesję.

### Endpointy panelu (`server/api/admin/`, wszystkie `requireAdmin`)

- `GET /leads` — lista; parametry `?status=&branza=&q=` (filtr + szukajka po
  imieniu/kontakcie).
- `GET /leads/[id]` — lead + jego notatki.
- `PATCH /leads/[id]` — zmiana `status` (walidacja: wartość z `LEAD_STATUSES`).
- `POST /leads/[id]/notes` — dodanie notatki (`body`; autor = zalogowany user).

### Warstwa wspólna (`server/utils/`)

- `auth.ts` — `hashPassword`/`verifyPassword` (argon2), `requireAdmin(event)`
  (sesja `mfa:true`, inaczej 401).
- `totp.ts` — `generateSecret`, `otpauthUrl`, `verifyTotp(secret, code)`.
- Rdzenie DI (jak w Warstwie 1): `handleLogin(input, deps)`,
  `handleTotpVerify(input, deps)` — testowalne bez Nitro/DB.

### Ochrona tras

- `/api/admin/**` → `requireAdmin` (401 bez `mfa:true`).
- `/admin/**` (poza `login`/`2fa`) → middleware Nuxt → redirect `/admin/login`.
- `/login` i `/2fa/verify` → throttling `rateLimit` po IP (z Warstwy 1).

---

## 6. Bezpieczeństwo

- Hasła `argon2id`, nigdy nie logowane; atrapa-hash przy nieznanym emailu
  (brak enumeracji przez timing); komunikat ogólny.
- Sesja: sealed cookie, `httpOnly`, `secure` (prod), `sameSite=lax`,
  `NUXT_SESSION_PASSWORD` ≥32 znaki.
- Sesja pending (`mfa:false`) bez wstępu do panelu — brama na każdym chronionym
  endpoincie i w middleware.
- Throttling po IP na `/login` i `/2fa/verify` (blokada zgadywania kodu).
- TOTP: ±1 okno tolerancji; sekret w bazie traktowany jako wrażliwy.
- Brak publicznej rejestracji — konta tylko przez CLI.

---

## 7. Testy (TDD)

- **Jednostkowe:** `auth.ts` (hash/verify roundtrip, odrzucenie złego hasła),
  `totp.ts` (kod z `otpauth` przechodzi; zły/wygasły odrzucony),
  `requireAdmin` (wpuszcza `mfa:true`, odrzuca pending/brak — wstrzykiwana sesja).
- **Rdzenie logiki:** `handleLogin` i `handleTotpVerify` — DI, pełne pokrycie
  ścieżek (złe hasło → throttle → next-step; enrollment vs verify; zły kod).
  Walidacja `PATCH status` i tworzenia notatki.
- **Formularze:** logika logowania/2FA w composable'ach (node env, mock
  `$fetch`) — wzorzec `useLeadForm` z Warstwy 1 (środowisko Nuxt-vitest dalej
  się wiesza — patrz §9).
- **Smoke (throwaway, żywy Docker):** `user:create` → login → kod TOTP → wpis
  notatki.

---

## 8. CLI

Skrypty w `scripts/`, uruchamiane przez `tsx` (reuse schematu Drizzle),
wpięte w `package.json`:

- `user:create` — pyta o email + hasło, hashuje `argon2`, wstawia rekord
  (bez `totp` — ustawi się przy 1. logowaniu).
- `user:reset-2fa <email>` — czyści `totp_secret`/`totp_enabled`.

---

## 9. Otwarte kwestie / długi techniczne (z Warstwy 1)

- **Render komponentów w testach:** środowisko Nuxt/happy-dom vitest wiesza
  pulę workerów (`nuxt@4.4.5` + `@nuxt/test-utils@4.0.3`). Do czasu podbicia
  `@nuxt/test-utils` testujemy logikę formularzy przez composable'y w node env.
- **Zaufane proxy dla IP** (rate-limit po `X-Forwarded-For`) — dotyczy też
  throttlingu logowania; bramka wdrożeniowa z `USTALENIA §10`.
- **Rate-limit w pamięci procesu** — wystarcza na start; przy skalowaniu
  wspólny store.
- Hosting docelowy (Node + MySQL w UE) — wciąż odłożony; budujemy lokalnie.
