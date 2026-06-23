<script setup lang="ts">
/**
 * /test — podgląd propozycji logo dla witrynovo.pl.
 * Logotypy są wstawione inline (nie przez <img>), więc wordmark dziedziczy
 * font Inter i kolory motywu — globalny ThemeToggle z nawigacji przełącza
 * całą stronę między jasnym a ciemnym, pokazując oba warianty na żywo.
 * Pliki źródłowe: /public/img/logos/logo-*.svg
 */
useHead({ title: 'Logo — propozycje · witrynovo.pl' })

const logos = [
  { n: '01', file: 'logo-01-browser.svg', name: 'Okno przeglądarki', desc: 'Klasyczny, czytelny symbol „strony www". Najbezpieczniejszy wybór, świetny na favicon.' },
  { n: '02', file: 'logo-02-storefront.svg', name: 'Witryna z markizą', desc: 'Okno wystawowe lokalnego sklepu z markizą. Najbliżej znaczenia nazwy i grupy docelowej.' },
  { n: '03', file: 'logo-03-panes.svg', name: 'Szyby okienne', desc: 'Pełny gradient z krzyżem szprosów = okno. Geometryczny, mocny, nowoczesny.' },
  { n: '04', file: 'logo-04-monogram-w.svg', name: 'Monogram „W"', desc: 'Litera W kreślona gradientem. Minimalistyczny, abstrakcyjny, dobry na małe rozmiary.' },
  { n: '05', file: 'logo-05-window-spark.svg', name: 'Okno + iskra', desc: 'Konturowe okno ze szprosami i iskierką (novo = nowe). Lekki, „premium" charakter.' },
  { n: '06', file: 'logo-06-addressbar.svg', name: 'Pasek adresu', desc: 'Pole adresu z kłódką (https). Komunikuje „twój adres w sieci". Techniczny, lekki.' },
  { n: '07', file: 'logo-07-cursor.svg', name: 'Kliknięcie w oknie', desc: 'Okno z kursorem-strzałką. Nawiązuje do interakcji i custom-cursora na stronie.' },
  { n: '08', file: 'logo-08-stack.svg', name: 'Szablony / warstwy', desc: 'Nałożone karty = gotowe szablony stron. Pasuje do oferty „wybierz i dostosuj".' },
  { n: '09', file: 'logo-09-glass.svg', name: 'Szkło / refleks', desc: 'Pełna bryła z refleksem światła na szybie. Czysty, „glassy", premium kafelek.' },
  { n: '10', file: 'logo-10-badge.svg', name: 'Okrągły emblemat', desc: 'Koło z mini-przeglądarką. Idealny jako sama ikonka/avatar (social media, favicon).' },
]
</script>

<template>
  <main class="min-h-screen bg-paper px-6 pb-24 pt-28 text-ink">
    <div class="mx-auto max-w-6xl">
      <!-- header -->
      <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <NuxtLink
            to="/"
            data-cursor="hover"
            class="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            ← wróć na stronę
          </NuxtLink>
          <h1 class="display text-4xl sm:text-5xl">
            <span class="text-gradient">witrynovo.pl</span>
          </h1>
          <p class="mt-2 max-w-xl text-muted">
            10 propozycji logo. Przełącz motyw (ikona w prawym górnym rogu), żeby
            zobaczyć każdy wariant na jasnym i ciemnym tle.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <!-- grid -->
      <div class="grid gap-5 sm:grid-cols-2">
        <article
          v-for="logo in logos"
          :key="logo.n"
          class="theme-fade flex flex-col rounded-2xl border border-line bg-paper-soft p-6"
        >
          <div class="mb-5 flex items-center justify-between">
            <span class="text-xs font-extrabold tracking-[0.12em] text-brand-2">{{ logo.n }}</span>
            <code class="text-[11px] text-muted">{{ logo.file }}</code>
          </div>

          <!-- main lockup (adapts to theme) -->
          <div class="flex min-h-[88px] flex-1 items-center justify-center rounded-xl bg-paper px-4 py-6">
            <!-- 01 -->
            <svg v-if="logo.n === '01'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t1" x1="8" y1="14" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="8" y="14" width="48" height="44" rx="12" fill="url(#t1)"/>
              <circle cx="17" cy="24" r="2.2" fill="#fff" opacity=".9"/><circle cx="25" cy="24" r="2.2" fill="#fff" opacity=".9"/><circle cx="33" cy="24" r="2.2" fill="#fff" opacity=".9"/>
              <rect x="15" y="33" width="34" height="17" rx="4" fill="#fff" opacity=".92"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 02 -->
            <svg v-else-if="logo.n === '02'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t2" x1="11" y1="18" x2="53" y2="34" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".55" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="14" y="31" width="36" height="25" rx="4" fill="none" stroke="currentColor" stroke-width="3" opacity=".85"/>
              <line x1="32" y1="40" x2="32" y2="56" stroke="currentColor" stroke-width="3" opacity=".45"/>
              <path d="M11 19 H53 V30 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 Z" fill="url(#t2)"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 03 -->
            <svg v-else-if="logo.n === '03'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t3" x1="11" y1="15" x2="53" y2="57" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="11" y="15" width="42" height="42" rx="12" fill="url(#t3)"/>
              <rect x="30" y="15" width="4" height="42" fill="#fff"/><rect x="11" y="34" width="42" height="4" fill="#fff"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 04 -->
            <svg v-else-if="logo.n === '04'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t4" x1="11" y1="17" x2="53" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <path d="M11 17 L21 54 L32 31 L43 54 L53 17" stroke="url(#t4)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 05 -->
            <svg v-else-if="logo.n === '05'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t5" x1="12" y1="17" x2="50" y2="55" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="12" y="18" width="38" height="38" rx="10" stroke="url(#t5)" stroke-width="4.5" fill="none"/>
              <line x1="31" y1="20" x2="31" y2="54" stroke="url(#t5)" stroke-width="3" opacity=".5"/><line x1="14" y1="37" x2="48" y2="37" stroke="url(#t5)" stroke-width="3" opacity=".5"/>
              <path d="M51 10 C51.7 14.6 53 15.9 57.6 16.6 C53 17.3 51.7 18.6 51 23.2 C50.3 18.6 49 17.3 44.4 16.6 C49 15.9 50.3 14.6 51 10 Z" fill="#ec4899"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 06 -->
            <svg v-else-if="logo.n === '06'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t6" x1="14" y1="28" x2="26" y2="44" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>
              <rect x="9" y="24" width="47" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".4"/>
              <circle cx="20" cy="36" r="5" fill="url(#t6)"/><rect x="18.6" y="35.4" width="2.8" height="3.4" rx="0.6" fill="#fff"/><path d="M18.8 35.4 v-1 a1.2 1.2 0 0 1 2.4 0 v1" stroke="#fff" stroke-width="1" fill="none"/>
              <rect x="30" y="33.5" width="20" height="3.2" rx="1.6" fill="currentColor" opacity=".3"/><rect x="30" y="38.5" width="13" height="3.2" rx="1.6" fill="currentColor" opacity=".18"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 07 -->
            <svg v-else-if="logo.n === '07'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t7" x1="9" y1="15" x2="55" y2="57" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="9" y="15" width="46" height="42" rx="12" fill="url(#t7)"/>
              <path d="M25 23 L25 47 L31 41.5 L35 50 L38.4 48.4 L34.4 40 L42 40 Z" fill="#fff"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 08 -->
            <svg v-else-if="logo.n === '08'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t8" x1="12" y1="22" x2="50" y2="52" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <rect x="20" y="13" width="36" height="28" rx="7" fill="url(#t8)" opacity=".3"/><rect x="12" y="22" width="38" height="30" rx="8" fill="url(#t8)"/>
              <circle cx="20" cy="30" r="1.8" fill="#fff" opacity=".9"/><circle cx="26" cy="30" r="1.8" fill="#fff" opacity=".9"/><circle cx="32" cy="30" r="1.8" fill="#fff" opacity=".9"/>
              <rect x="19" y="36" width="24" height="9" rx="2.5" fill="#fff" opacity=".9"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 09 -->
            <svg v-else-if="logo.n === '09'" viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t9" x1="10" y1="15" x2="54" y2="57" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient><clipPath id="tc9"><rect x="10" y="15" width="44" height="42" rx="13"/></clipPath></defs>
              <rect x="10" y="15" width="44" height="42" rx="13" fill="url(#t9)"/>
              <g clip-path="url(#tc9)"><path d="M24 60 L44 12 L52 12 L32 60 Z" fill="#fff" opacity=".22"/><path d="M14 60 L28 12 L33 12 L19 60 Z" fill="#fff" opacity=".14"/></g>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
            <!-- 10 -->
            <svg v-else viewBox="0 0 320 72" class="h-12 w-auto max-w-full" fill="none">
              <defs><linearGradient id="t10" x1="14" y1="14" x2="54" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#6d5efc"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
              <circle cx="34" cy="36" r="24" fill="url(#t10)"/><rect x="22" y="27" width="24" height="18" rx="4" fill="#fff"/><line x1="22" y1="33" x2="46" y2="33" stroke="url(#t10)" stroke-width="1.8"/>
              <circle cx="26" cy="30" r="1.3" fill="#a855f7"/><circle cx="30.5" cy="30" r="1.3" fill="#ec4899"/>
              <text x="82" y="47" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="-1.4" fill="currentColor">witrynovo<tspan fill="#a855f7">.pl</tspan></text>
            </svg>
          </div>

          <!-- meta + favicon preview -->
          <div class="mt-5 flex items-start justify-between gap-4">
            <div>
              <h2 class="font-bold tracking-tight">{{ logo.name }}</h2>
              <p class="mt-1 text-sm leading-relaxed text-muted">{{ logo.desc }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink ring-1 ring-line">
                <svg viewBox="0 0 64 72" class="h-5 w-5" fill="none"><use :href="`#i${logo.n}`" /></svg>
              </span>
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b0b0d] text-white ring-1 ring-line">
                <svg viewBox="0 0 64 72" class="h-5 w-5" fill="none"><use :href="`#i${logo.n}`" /></svg>
              </span>
            </div>
          </div>
        </article>
      </div>

      <p class="mt-12 text-center text-sm text-muted">
        Pliki SVG: <code>public/img/logos/</code> · ta strona: <code>app/pages/test.vue</code>
      </p>
    </div>

    <!-- icon-only symbols (referenced by the favicon chips via <use>) -->
    <svg width="0" height="0" class="absolute" aria-hidden="true">
      <symbol id="i01" viewBox="0 0 64 72">
        <rect x="8" y="14" width="48" height="44" rx="12" fill="url(#t1)"/>
        <circle cx="17" cy="24" r="2.2" fill="#fff" opacity=".9"/><circle cx="25" cy="24" r="2.2" fill="#fff" opacity=".9"/><circle cx="33" cy="24" r="2.2" fill="#fff" opacity=".9"/>
        <rect x="15" y="33" width="34" height="17" rx="4" fill="#fff" opacity=".92"/>
      </symbol>
      <symbol id="i02" viewBox="0 0 64 72">
        <rect x="14" y="31" width="36" height="25" rx="4" fill="none" stroke="currentColor" stroke-width="3" opacity=".85"/>
        <line x1="32" y1="40" x2="32" y2="56" stroke="currentColor" stroke-width="3" opacity=".45"/>
        <path d="M11 19 H53 V30 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 a4.2 4.2 0 0 1 -8.4 0 Z" fill="url(#t2)"/>
      </symbol>
      <symbol id="i03" viewBox="0 0 64 72">
        <rect x="11" y="15" width="42" height="42" rx="12" fill="url(#t3)"/>
        <rect x="30" y="15" width="4" height="42" fill="#fff"/><rect x="11" y="34" width="42" height="4" fill="#fff"/>
      </symbol>
      <symbol id="i04" viewBox="0 0 64 72">
        <path d="M11 17 L21 54 L32 31 L43 54 L53 17" stroke="url(#t4)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </symbol>
      <symbol id="i05" viewBox="0 0 64 72">
        <rect x="12" y="18" width="38" height="38" rx="10" stroke="url(#t5)" stroke-width="4.5" fill="none"/>
        <line x1="31" y1="20" x2="31" y2="54" stroke="url(#t5)" stroke-width="3" opacity=".5"/><line x1="14" y1="37" x2="48" y2="37" stroke="url(#t5)" stroke-width="3" opacity=".5"/>
        <path d="M51 10 C51.7 14.6 53 15.9 57.6 16.6 C53 17.3 51.7 18.6 51 23.2 C50.3 18.6 49 17.3 44.4 16.6 C49 15.9 50.3 14.6 51 10 Z" fill="#ec4899"/>
      </symbol>
      <symbol id="i06" viewBox="0 0 64 72">
        <rect x="9" y="24" width="47" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".4"/>
        <circle cx="20" cy="36" r="5" fill="url(#t6)"/><rect x="18.6" y="35.4" width="2.8" height="3.4" rx="0.6" fill="#fff"/><path d="M18.8 35.4 v-1 a1.2 1.2 0 0 1 2.4 0 v1" stroke="#fff" stroke-width="1" fill="none"/>
        <rect x="30" y="33.5" width="20" height="3.2" rx="1.6" fill="currentColor" opacity=".3"/><rect x="30" y="38.5" width="13" height="3.2" rx="1.6" fill="currentColor" opacity=".18"/>
      </symbol>
      <symbol id="i07" viewBox="0 0 64 72">
        <rect x="9" y="15" width="46" height="42" rx="12" fill="url(#t7)"/>
        <path d="M25 23 L25 47 L31 41.5 L35 50 L38.4 48.4 L34.4 40 L42 40 Z" fill="#fff"/>
      </symbol>
      <symbol id="i08" viewBox="0 0 64 72">
        <rect x="20" y="13" width="36" height="28" rx="7" fill="url(#t8)" opacity=".3"/><rect x="12" y="22" width="38" height="30" rx="8" fill="url(#t8)"/>
        <circle cx="20" cy="30" r="1.8" fill="#fff" opacity=".9"/><circle cx="26" cy="30" r="1.8" fill="#fff" opacity=".9"/><circle cx="32" cy="30" r="1.8" fill="#fff" opacity=".9"/>
        <rect x="19" y="36" width="24" height="9" rx="2.5" fill="#fff" opacity=".9"/>
      </symbol>
      <symbol id="i09" viewBox="0 0 64 72">
        <rect x="10" y="15" width="44" height="42" rx="13" fill="url(#t9)"/>
        <g clip-path="url(#tc9)"><path d="M24 60 L44 12 L52 12 L32 60 Z" fill="#fff" opacity=".22"/><path d="M14 60 L28 12 L33 12 L19 60 Z" fill="#fff" opacity=".14"/></g>
      </symbol>
      <symbol id="i10" viewBox="0 0 64 72">
        <circle cx="34" cy="36" r="24" fill="url(#t10)"/><rect x="22" y="27" width="24" height="18" rx="4" fill="#fff"/><line x1="22" y1="33" x2="46" y2="33" stroke="url(#t10)" stroke-width="1.8"/>
        <circle cx="26" cy="30" r="1.3" fill="#a855f7"/><circle cx="30.5" cy="30" r="1.3" fill="#ec4899"/>
      </symbol>
    </svg>
  </main>
</template>
