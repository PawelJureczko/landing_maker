# Backend / CRM witrynovo.pl — design

> Spec fundamentu backendu i pierwszej warstwy (przyjmowanie leadów).
> Data: **2026-06-23**. Powiązany dokument biznesowy: [`docs/USTALENIA.md`](../../USTALENIA.md).

---

## 1. Cel i zakres

Wewnętrzny **back-office (CRM) dla witrynovo.pl** — narzędzie dla właścicieli
serwisu, nie dla klientów końcowych. Obsługuje ścieżkę biznesową:

> **lead → klient → projekt → abonament**

(czyli pipeline z USTALENIA: *nowy → projekt wysłany → poprawki → klient →
abonament*).

**W zakresie:**
- przyjmowanie i baza leadów (zamyka żywy `TODO` w `CtaSection.vue`),
- panel admina (CRM) za logowaniem,
- modelowanie klientów, projektów i abonamentów.

**Poza zakresem (świadomie, YAGNI):**
- integracje rezerwacji (Booksy/Calendly) — osobny, późniejszy produkt
  (zgodnie z USTALENIA §5),
- jakiekolwiek konta / logowanie dla klientów lub leadów,
- publiczna rejestracja, reset hasła dla użytkowników, portal klienta.

### Kto się loguje

Logowanie jest **wyłącznie wewnętrzne** — Wy, właściciele (1–3 konta).
Leady i klienci to **tylko rekordy danych**, bez żadnego dostępu. Jedyna
publicznie wystawiona końcówka to `POST /api/leads`; cała reszta siedzi za
sesją w `/admin`.

---

## 2. Architektura i stack

Jeden projekt **Nuxt 4** (to repo) z **renderowaniem hybrydowym** — bez
drugiego repo, bez osobnego serwisu backendowego.

```
Nuxt 4 (jedno repo, jeden Nitro)
├─ Marketing (/, prerender)         → statyczne, szybkie, SEO – jak dziś
├─ /api/*  (Nitro server routes)    → cała logika backendu
├─ /admin/* (SSR, za logowaniem)    → panel CRM (Warstwa 2+)
└─ warstwa danych
     ├─ Drizzle ORM + migracje
     └─ MySQL  (lokalnie: Docker;  docelowo: host w UE)
```

| Element | Wybór | Uzasadnienie |
|---|---|---|
| Runtime | Nuxt 4 + Nitro (Node) | Ten sam stack co strona; logika w server routes. |
| Renderowanie | Hybryda (`routeRules`) | Marketing `prerender: true` (zero straty SEO/perf), `/api` + `/admin` SSR. |
| Baza | **MySQL** | Preferencja/znajomość zespołu. |
| ORM | **Drizzle** + migracje | Lekki, TypeScript-first, dobre wsparcie migracji. |
| Auth | **`nuxt-auth-utils`** (sesja w szyfrowanym cookie) + `argon2` | Nie piszemy własnej autoryzacji od zera; tylko konta zespołu. |
| 2FA | **TOTP** (aplikacja authenticator), Warstwa 2 | Darmowe, prywatne, bez zewnętrznego dostawcy. |
| Mail | abstrakcja `sendMail()` | Dev: Mailpit/log (bez realnej wysyłki). Prod: SMTP/Resend. |
| Konfiguracja | `.env` → `runtimeConfig` | Dane MySQL, sekret sesji, adres docelowy maila. |

**Runtime uwaga (hosting docelowy):** ponieważ MySQL to połączenie TCP,
SSR-owy Nuxt stoi na **runtime Node (VPS / host node'owy), nie na edge**
(Cloudflare Workers kiepsko łączy się z klasycznym MySQL). Na ten moment
budujemy i uruchamiamy **lokalnie**; wybór hostingu odkładamy — architektura
Node + MySQL jest przenośna, więc nic nas nie zablokuje. Cloudflare może
zostać z przodu jako CDN/DNS.

**Zmiana względem dziś:** `nuxt generate` → tryb hybrydowy. Strony
marketingowe pozostają prerenderowane i nie tracą nic na wydajności/SEO.

---

## 3. Model danych (wspólny, implementowany warstwami)

Projektujemy docelowy kształt, ale implementujemy stopniowo. Rdzeń:
**lead → klient → projekt → abonament**.

| Tabela | Po co | Warstwa |
|---|---|---|
| `leads` | każde zgłoszenie z formularza: imię, kontakt, branża, firma, wiadomość, źródło, **status**, znacznik czasu | **1 (teraz)** |
| `users` | konta zespołu do panelu: email, hash hasła (`argon2`), `totp_secret`, `totp_enabled` | 2 |
| `clients` | lead „wszedł" → klient (dane firmy, kontakt); relacja `clients.lead_id` | 3 |
| `projects` | strona realizowana dla klienta: status realizacji, rundy poprawek, link | 3 |
| `subscriptions` | abonament klienta: kwota startowa, miesięczna, status, dodatki (teksty/domena/rezerwacje) | 3 |

**Kluczowa decyzja projektowa:** `leads` od początku trzyma `status`, więc
panel (Warstwa 2) dokłada się **bez zmiany schematu**, a konwersja
lead→klient (Warstwa 3) to relacja `clients.lead_id`. Kolumny `totp_*`
w `users` przewidziane od razu, by dołożenie 2FA nie ruszało schematu.
Nic nie trzeba będzie przepisywać.

### Statusy leada (enum)

`new` → `contacted` → `project_sent` → `revisions` → `won` / `lost`
(odzwierciedla pipeline z USTALENIA).

---

## 4. Plan warstwowy

System budujemy w trzech warstwach na wspólnym fundamencie. **Ten spec
realizujemy do końca Warstwy 1**; Warstwy 2–3 dostaną własne plany.

1. **Warstwa 1 — przyjmowanie leadów** *(pierwszy spec do realizacji)*
   - fundament: hybryda Nuxt, Drizzle + MySQL, `docker-compose`, migracje,
   - `POST /api/leads`, walidacja, anty-spam, zapis, mail,
   - podłączenie `CtaSection.vue`, zgoda RODO + polityka prywatności.
2. **Warstwa 2 — panel admina (CRM)**
   - `nuxt-auth-utils` + `argon2`, **TOTP 2FA**, `users` (konta ręczne),
   - `/admin`: lista leadów, zmiana statusu, notatki.
3. **Warstwa 3 — klienci / projekty / abonamenty**
   - konwersja lead→klient, śledzenie realizacji i abonamentu.

---

## 5. Warstwa 1 — szczegół (zakres tego specu)

### 5.1. Endpoint `POST /api/leads`

**Walidacja (serwerowa = źródło prawdy), schema Valibot** — lustrzane reguły
do `CtaSection.vue`:

| Pole | Reguła |
|---|---|
| `imie` | wymagane, niepuste |
| `kontakt` | wymagane; musi być **telefon lub e-mail** |
| `branza` | wymagane; wartość z listy branż |
| `firma` | opcjonalne |
| `wiadomosc` | opcjonalne |

Błędy walidacji → `422` z mapą błędów pól; front pokazuje je przy polach.

### 5.2. Anty-spam (bez captcha na start, prywatnie)

1. **Honeypot** — ukryte pole; wypełnione = bot → cicho odrzucamy (udajemy
   sukces, nie zapisujemy).
2. **Time-trap** — zgłoszenie szybsze niż ~2 s od wyrenderowania = bot.
3. **Rate-limit po IP** — kilka zgłoszeń/min max.
4. *(Opcjonalnie później)* Cloudflare Turnstile, gdyby spam przeszedł.

### 5.3. Zapis

Drizzle `insert` do `leads`: `status='new'`, `source`, znacznik czasu.
**Baza jest źródłem prawdy.**

### 5.4. Mail (best-effort)

`sendMail()` → powiadomienie na `kontakt@witrynovo.pl` z danymi leada.
- Jeśli zapis do bazy się uda, a mail **nie** — lead i tak jest zapisany;
  zwracamy sukces, logujemy błąd maila (**nie tracimy leada**).
- Jeśli pada **zapis do bazy** → `500`; front: „spróbuj ponownie / zadzwoń".

### 5.5. Front — `CtaSection.vue`

- podmiana `// TODO` na realny `fetch('/api/leads')`,
- zachowany obecny ekran sukcesu + obsługa błędu,
- **RODO:** dodajemy **checkbox zgody + link do polityki prywatności**
  (dziś brak; wymóg przy zbieraniu danych osobowych; jest na liście TODO
  w USTALENIA §10),
- **Polityka prywatności** jako mały element tej warstwy (strona + link).

### 5.6. Setup lokalny

- `docker-compose` z **MySQL + Mailpit** (podgląd maili w przeglądarce,
  zero realnej wysyłki),
- `.env.example` (dane MySQL, sekret sesji, adres docelowy maila),
- migracje Drizzle + prosty seed.

---

## 6. Obsługa błędów

| Sytuacja | Odpowiedź | Zachowanie |
|---|---|---|
| Zły input | `422` + błędy pól | front pokazuje przy polach |
| Spam (honeypot/time-trap) | `200` (udany sukces) | nic nie zapisujemy |
| Przekroczony rate-limit | `429` | front: „chwila, spróbuj ponownie" |
| Błąd zapisu do bazy | `500` | front: „spróbuj ponownie / zadzwoń" |
| Błąd maila (baza OK) | `200` | sukces; błąd maila tylko logowany |

---

## 7. Bezpieczeństwo i RODO

- Dane osobowe leadów (imię, kontakt) — **zgoda + polityka prywatności**
  wymagane przy zbieraniu (Warstwa 1).
- Hosting docelowy w **UE** (decyzja przy wyborze hostingu).
- Hasła zespołu: `argon2`. Sesje: szyfrowane cookie (`nuxt-auth-utils`).
- **2FA (TOTP)** na kontach zespołu (Warstwa 2).
- Jedyna publiczna końcówka: `POST /api/leads`. Reszta za sesją.

---

## 8. Testy (TDD)

- **Jednostkowe:** walidacja (Valibot), logika anty-spamu (honeypot,
  time-trap, rate-limit).
- **Integracyjne:** `POST /api/leads`:
  - poprawny lead → wpis w bazie **i** `sendMail` wywołany,
  - spam → odrzucony, brak wpisu,
  - zły input → `422` z błędami pól,
  - błąd maila → lead zapisany, odpowiedź sukces.

---

## 9. Otwarte kwestie (do potwierdzenia przy realizacji)

- Realny **adres docelowy** powiadomień (domyślnie `kontakt@witrynovo.pl`).
- Dostawca maila w **produkcji** (SMTP vs Resend) — decyzja przy hostingu.
- Treść **polityki prywatności** (osobny, krótki dokument).
