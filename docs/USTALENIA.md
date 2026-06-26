# Ustalenia — strona witrynovo.pl

> Dokument zbiera wszystkie decyzje biznesowe i treściowe dotyczące strony.
> Stan na: **18.06.2026**. Nazwa marki: **witrynovo.pl** (zdecydowana 23.06.2026).
> Ceny to nadal placeholdery do podmiany.

---

## 1. Model biznesowy

- **Czym jest:** usługa **done-for-you** — tworzymy proste, szybkie, dedykowane
  landing page / strony dla **lokalnych mikrofirm bez własnej strony**
  (fryzjer, barber, kosmetyczka, mechanik, kwiaciarnia, restauracja, siłownia…).
- **To NIE jest self-serve SaaS** — to my robimy stronę dla klienta. Biznes
  **lead-genowy**, nie subskrypcja, którą klient sam sobie klika.
- **Zasięg:** ogólnopolski (zdalnie). **Faza 2:** regionalne subdomeny pod
  lokalne SEO, np. `krakow.domena.pl` („strona internetowa fryzjer Kraków”).

## 2. Cel strony

- Jeden dominujący cel konwersji: **zostawienie kontaktu / zamówienie darmowego
  projektu** (lead).
- Strona ma przekonać sceptycznego, często nietechnicznego właściciela, że
  strona realnie **przyciąga klientów**.

## 3. Główny hak / oferta (filar zaufania)

Wybrany hak **#1 (najmocniejszy):** darmowy mockup pod konkretny biznes.

**Mechanizm (chroni też nasz czas):**
> Wypełnij formularz → robimy **darmowy projekt** strony → **2 darmowe rundy
> poprawek** → dopiero teraz decydujesz. Wchodzisz — pracujemy dalej. Nie
> wchodzisz — nie płacisz nic.

To główne odwrócenie ryzyka przy starcie (zerowe portfolio = gwarancja przejmuje
rolę dowodu). Limit 2 rund chroni przed pracą za darmo w nieskończoność.

## 4. Cennik

Model: **niski próg wejścia + abonament** (wybrana opcja #2).

| Składnik | Cena |
|---|---|
| Baza (1 strona + hosting) | **499 zł na start + 49 zł/mc** |
| Treści (napiszcie za mnie) | +300 zł na start |
| Pełna strona (zamiast 1 landinga) | +400 zł na start |
| Domena (załatwcie za mnie) | ~80 zł/rok → liczone jako ~7 zł/mc w abonamencie |
| Rezerwacje online | +20 zł/mc |

- **Cena pokazywana wprost na stronie** (transparentność > ukrywanie; przy tak
  niskich kwotach nie odstrasza).
- Wynik konfiguratora = **dwie liczby**: „X zł na start + Y zł/mc” z rozbiciem.
- Framing: „49 zł/mc — mniej niż jedna wizyta. Jeśli strona przyprowadzi choć
  jednego klienta w miesiącu, już się zwróciła.”
- ⚠️ Ceny do edycji — to wartości robocze.

### Konfigurator (3 + 1)

Interaktywny, cena liczona na żywo. Etykiety **bez żargonu**, z podpowiedziami.

1. **Zakres** — Jedna strona / Pełna strona (+400 start)
2. **Teksty** — Dostarczę własne / Napiszcie za mnie (+300 start)
3. **Domena** — Mam swój adres / Załatwcie za mnie (+w abonamencie)
4. **Rezerwacje** (przełącznik) — +20/mc, po włączeniu pole warunkowe:
   *„Z jakiego systemu korzystasz?”* → Booksy / Calendly / Inny / Nie mam.

## 5. Rezerwacje — decyzja techniczna

- **W V1 NIE budujemy własnego backendu.** Własna baza + VPS + RODO (dane
  osobowe cudzych klientów) to inny, ryzykowny biznes — i 20 zł/mc tego nie
  pokrywa.
- **Rezerwacje = integracja z gotowcem:** Booksy (standard u fryzjerów/barberów
  w PL), Calendly, lub formularz „prośba o termin” na maila.
- Własny silnik rezerwacji = ewentualnie osobny, droższy produkt w przyszłości.

## 6. Formularz kontaktowy / dane

- **Bez bazy danych.** Leady idą **na maila** (np. Formspree albo server route
  → mail).
- Pola: Imię*, Telefon lub e-mail*, Branża*, Nazwa firmy, Wiadomość (opcj.).
- Po włączeniu rezerwacji w konfiguratorze — dopytujemy o system rezerwacji.

## 7. Dowód / portfolio

- **Realizacja #1 (jedyna, ale prawdziwa):** [Razor Sznyt](https://razorsznyt.pl)
  — barbershop w Knurowie. Kolega; pełna zgoda na nazwę, link, opinię, przed/po.
- **Przed/po:** wcześniej tylko Instagram + Facebook → dziś własna strona.
- **Opinia (placeholder do potwierdzenia u klienta):**
  > „To nie jest po prostu ładna strona — to narzędzie, które realnie pomaga nam
  > zdobywać klientów. witrynovo.pl świetnie wyczuli klimat naszego barbershopu
  > i przełożyli go na stronę, która wygląda dobrze i działa jeszcze lepiej.”
- Pozostałe przykłady (kwiaciarnia, mechanik, restauracja…) = makiety demo,
  uczciwie podpisane „Przykład”.

## 8. Struktura strony (sekcje)

1. **Hero** — „Zobacz swoją nową stronę *za darmo.* Płacisz, gdy Ci się spodoba”
2. **Jak to działa** — formularz → darmowy projekt → 2 poprawki → decyzja
3. **Funkcje (korzyści)** — „Mniej zachodu. Więcej klientów” (Google, zaufanie,
   gotowe w kilka dni, rezerwacje, zero technicznych zmartwień)
4. **Case study** — Razor Sznyt (prawdziwy zrzut + opinia + link)
5. **Przykłady** — galeria: barber (realizacja) + demo branż
6. **„Mam Facebooka, po co mi strona?”** — obalenie głównej wymówki
7. **Cennik** — konfigurator z ceną na żywo
8. **Kontakt** — formularz (na maila)
9. **Stopka**

Ton i copy: **po polsku**, język właściciela zakładu, bez żargonu.

## 9. Stack techniczny

- **Nuxt 4** + Vue 3, **Tailwind CSS v4** (tokeny w `app/assets/css/main.css`)
- **GSAP + ScrollTrigger** (animacje, scroll-driven), **Lenis** (smooth scroll)
- Tryb **jasny i ciemny** (toggle, zapis w `localStorage`, bez flasha)
- Dostępność: `:focus-visible`, `prefers-reduced-motion`, `aria-*`
- `robots.txt` + `sitemap.xml` w `public/` (domena `https://witrynovo.pl/`)
- **SEO/social:** komplet favicon, `og.png`, meta Open Graph + Twitter card,
  `canonical` — konfigurowane w `nuxt.config.ts` (`app.head`)
- Zrzut realizacji: `public/img/razorsznyt.png`

## 10. Do zrobienia (techniczne)

- [x] **Realna wysyłka formularza** — `$fetch POST /api/leads` z honeypot, timestamp `ts`, zgodą RODO
      (Task 6 — `CtaSection.vue`)
- [x] **Prawdziwa nazwa marki** — `witrynovo.pl` wdrożona (nav, stopka, tytuł,
      meta OG/Twitter, mail `kontakt@witrynovo.pl`, logo, favicon, og.png,
      sitemap/robots). Pozostaje: realny **telefon** kontaktowy.
- [x] **Polityka prywatności** (RODO) — `app/pages/polityka-prywatnosci.vue` (Task 6)
- [ ] Potwierdzić realną **opinię** od Razor Sznyt (najlepiej o efekcie biznesowym)
- [ ] Ustalić finalne **ceny** (obecne są robocze)
- [ ] Opcjonalnie: prawdziwe zdjęcia/treści w demo-przykładach zamiast makiet
- [ ] Faza 2: regionalne subdomeny pod lokalne SEO

### Bramki przed produkcją (Warstwa 1 — leady)

- [ ] **Smoke end-to-end** — odpalić lokalnie `docker compose up -d` + `npm run dev`,
      wysłać formularz: sprawdzić `{"ok":true}`, wiersz w tabeli `leads` i mail w
      Mailpit (http://localhost:8025). Ścieżki DB/mail/HTTP nie są pokryte testem
      automatycznym (środowisko Nuxt/happy-dom vitest zawiesza się lokalnie).
- [ ] **Zaufane proxy dla IP** — `POST /api/leads` liczy rate-limit po IP z nagłówka
      `X-Forwarded-For`. Bez proxy nadpisującego ten nagłówek (Cloudflare/nginx)
      atakujący omija limit. Przy wyborze hostingu: zapewnić takie proxy albo
      przełączyć na IP gniazda (`server/api/leads.post.ts`).
- [ ] **Rate-limit w pamięci procesu** — `server/utils/antispam.ts` trzyma liczniki
      w `Map` (reset przy restarcie, brak współdzielenia między instancjami, brak
      czyszczenia bezczynnych IP). Wystarcza na start; przy skalowaniu wymienić na
      wspólny store i/lub Cloudflare Turnstile.
- [ ] **Docker port** — lokalnie `3307:3306` (konflikt z innym MySQL). Na czystej
      maszynie/CI wrócić do `3306` (`docker-compose.yml` + `.env.example`).
- [ ] **Testy w środowisku Nuxt** — podbić `@nuxt/test-utils` do wersji zgodnej z
      `nuxt@4.4.5`, by dało się testować render komponentów (honeypot, checkbox,
      animacja sukcesu) — dziś pokryta tylko logika przez `useLeadForm`.

### Warstwa 2 — panel admina z 2FA (zbudowana)

- [x] **Panel `/admin`** — logowanie hasło (`argon2`) + obowiązkowe TOTP (enrollment
      QR przy 1. logowaniu, recovery `npm run user:reset-2fa`), lista leadów z
      filtrem/szukajką, szczegół ze zmianą statusu i notatkami. Konta: `npm run user:create`.
- [ ] **Smoke przeglądarkowy** — `npm run dev` u siebie: zaloguj `admin@witrynovo.pl`,
      przejdź enrollment 2FA, sprawdź listę/filtr, zmianę statusu i dodanie notatki.
      Logika + warstwa danych pokryte testami (69) i smoke'em na żywej bazie; sam
      render stron i wiring sesji (cookie) niesprawdzone automatem — wymaga ręcznego testu.
- [ ] **Zaufane proxy / rate-limit** — dotyczy też `/login` i `/2fa/verify` (ta sama
      bramka XFF + licznik w pamięci procesu, co Warstwa 1).
- [ ] **`NUXT_SESSION_PASSWORD`** — w produkcji ustawić realny, losowy sekret ≥32 znaki
      (lokalnie generowany przez `openssl rand`).

## 11. Placeholdery do podmiany

> Anti-spam: honeypot (`website` field, hidden) i time-trap (`ts` = `Date.now()` na `onMounted`) dodane w formularzu (Task 6). ✅



| Placeholder | Gdzie |
|---|---|
| ~~`[TwojaMarka]`~~ → `witrynovo.pl` | ✅ podmienione (nav, stopka, title/meta, case study) |
| ~~`kontakt@twojamarka.pl`~~ → `kontakt@witrynovo.pl` | ✅ podmienione (stopka) |
| `+48 000 000 000` | stopka — **do podmiany** |
| `twojafirma.pl` | przykłady, makiety (to celowo nazwa-przykład klienta) |
| Ceny (499 / 49 / 300 / 400 / 80 / 20) | `app/components/sections/PricingSection.vue` (obiekt `P`) |

## 12. Identyfikacja wizualna marki

- **Nazwa:** `witrynovo.pl` (gra słowem *witryna* = okno wystawowe / strona www
  + *novo* = nowe). W logotypie i nawigacji końcówka `.pl` w kolorze
  `--color-brand-2` (`#a855f7`).
- **Logo:** monogram **„W"** kreślony firmowym gradientem. Źródło:
  `app/components/BrandLogo.vue` (`viewBox 0 0 64 64`, `stroke-width 9`,
  zaokrąglone końce). Używane w nawigacji i stopce (`h-7 w-7`).
- **Gradient marki:** `#6d5efc → #a855f7 → #ec4899` (akcent sky `#38bdf8`).
  Tokeny w `app/assets/css/main.css` (`@theme`).
- **Typografia:** Inter (waga 800, `letter-spacing -0.04em`) dla wordmarku;
  Instrument Serif jako font ozdobny.
- **Favicon (wersja „kontenerowa" dla czytelności w małych rozmiarach):**
  gradientowy zaokrąglony kafelek + białe „W". Pliki w `public/`:
  `favicon.svg`, `favicon.ico` (16+32 px), `favicon-16x16.png`,
  `favicon-32x32.png`, `apple-touch-icon.png` (180 px). Podpięte w
  `nuxt.config.ts` → `app.head.link[]`.
- **Open Graph / social:** `public/og.png` (1200×630, ciemne tło + brandowa
  poświata, logo, hasło i tagline). Meta `og:*` + `twitter:card=summary_large_image`
  oraz `canonical https://witrynovo.pl/` w `nuxt.config.ts`.

> Uwaga: logo na stronie to gradientowe „W" na przezroczystym tle, a favicon to
> jego wersja w kafelku — oba pochodzą z tego samego monogramu (spójne).

## 13. Dziennik zmian

### 2026-06-23 — wdrożenie marki witrynovo.pl
- Wybrano nazwę **witrynovo.pl** oraz logo (monogram „W", opcja #4 z 10 propozycji).
- Podmieniono markę w całej stronie: nawigacja, stopka, cytat w case study,
  `title`/`description`, e-mail (`kontakt@witrynovo.pl`), klucz motywu
  w `localStorage` (`witrynovo-theme`), `sitemap.xml`, `robots.txt`,
  `package.json` (`name`), komentarze w CSS.
- Dodano komponent `BrandLogo.vue`; usunięto `PlumeLogo.vue`.
- Zwężono odstęp logo ↔ wordmark w navbarze (`gap-2` → `gap-1.5`).
- Dodano komplet favicon, `og.png` oraz pełne meta OG/Twitter + `canonical`.
- Usunięto artefakty robocze z fazy wyboru logo (podstrona `/test`,
  `public/img/logos/` — galeria i 10 propozycji).
- Commity: `0f80fcb` (branding) i `8b167ad` (usunięcie artefaktów),
  wypchnięte na `origin/main` (deploy Cloudflare).
- **Pozostaje:** realny numer telefonu w stopce (wciąż placeholder
  `+48 000 000 000`).

### 2026-06-23 — UX i typografia
- **Sekcja „Jak to działa" (`ProductReveal.vue`):** skrócono pinowany scroll
  `lg:h-[400vh]` → `lg:h-[300vh]`. Przewijanie w przypiętej sekcji: 3.00 → 2.00
  ekranu; kroki 01–04 przełączają się szybciej (~50vh na krok). Mobile / touch /
  reduced-motion bez zmian (tam brak pinowania). Zweryfikowano realnym
  przewijaniem (Chrome DevTools Protocol).
- **Myślniki:** w widocznym tekście strony zamieniono długie myślniki `—` na
  krótkie `-` (29 wystąpień: sekcje + meta `title`/`description`/OG/Twitter
  w `nuxt.config.ts`). Komentarze w kodzie pominięto (niewidoczne na stronie).
