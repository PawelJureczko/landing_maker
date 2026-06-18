# Ustalenia — strona [TwojaMarka]

> Dokument zbiera wszystkie decyzje biznesowe i treściowe dotyczące strony.
> Stan na: **18.06.2026**. Marka i ceny to placeholdery do podmiany.

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
  > zdobywać klientów. [TwojaMarka] świetnie wyczuli klimat naszego barbershopu
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
- `robots.txt` + `sitemap.xml` w `public/`
- Zrzut realizacji: `public/img/razorsznyt.png`

## 10. Do zrobienia (techniczne)

- [ ] **Realna wysyłka formularza** — endpoint Formspree lub server route → mail
      (oznaczone `TODO` w `CtaSection.vue`)
- [ ] **Prawdziwa nazwa marki** — podmiana `[TwojaMarka]` (nav, stopka, tytuł,
      meta, mail, telefon, domena `twojamarka.pl`)
- [ ] **Polityka prywatności + Regulamin** (RODO — wymagane przy zbieraniu danych)
- [ ] Potwierdzić realną **opinię** od Razor Sznyt (najlepiej o efekcie biznesowym)
- [ ] Ustalić finalne **ceny** (obecne są robocze)
- [ ] Opcjonalnie: prawdziwe zdjęcia/treści w demo-przykładach zamiast makiet
- [ ] Faza 2: regionalne subdomeny pod lokalne SEO

## 11. Placeholdery do podmiany

| Placeholder | Gdzie |
|---|---|
| `[TwojaMarka]` | nav, stopka, `nuxt.config.ts` (title/description), case study |
| `kontakt@twojamarka.pl` | stopka |
| `+48 000 000 000` | stopka |
| `twojafirma.pl` | przykłady, makiety (to celowo nazwa-przykład klienta) |
| Ceny (499 / 49 / 300 / 400 / 80 / 20) | `app/components/sections/PricingSection.vue` (obiekt `P`) |
