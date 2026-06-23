<script setup lang="ts">
const scrollTo = useScrollTo()

const socials = [
  { id: 'fb', label: 'Facebook' },
  { id: 'ig', label: 'Instagram' },
]

const cols = [
  {
    title: 'Oferta',
    links: [
      { label: 'Funkcje', href: '#features' },
      { label: 'Jak to działa', href: '#how' },
      { label: 'Przykłady', href: '#templates' },
      { label: 'Cennik', href: '#pricing' },
    ],
  },
  {
    title: 'Firma',
    links: [
      { label: 'O nas', href: '#' },
      { label: 'Realizacje', href: '#templates' },
      { label: 'Kontakt', href: '#kontakt' },
    ],
  },
]

function go(href: string) {
  if (href.length > 1) scrollTo(href, -90)
}

const year = 2026
</script>

<template>
  <footer class="theme-fade border-t border-line bg-paper">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <!-- brand -->
        <div>
          <div class="flex items-center gap-2">
            <BrandLogo class="h-7 w-7" />
            <span class="text-lg font-extrabold tracking-tight text-ink">witrynovo<span class="text-brand-2">.pl</span></span>
          </div>
          <p class="mt-4 max-w-xs text-sm text-muted">
            Proste, dopracowane strony internetowe dla lokalnych firm. Darmowy
            projekt, płacisz dopiero gdy Ci się spodoba.
          </p>
          <div class="mt-6 flex gap-3">
            <a
              v-for="s in socials"
              :key="s.id"
              href="#"
              :aria-label="s.label"
              data-cursor="hover"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-line text-xs font-bold uppercase text-muted transition-colors hover:border-brand/40 hover:text-brand"
              >{{ s.id }}</a
            >
          </div>
        </div>

        <!-- link columns -->
        <div v-for="c in cols" :key="c.title">
          <h3 class="text-sm font-semibold text-ink">{{ c.title }}</h3>
          <ul class="mt-4 space-y-2.5">
            <li v-for="l in c.links" :key="l.label">
              <button
                type="button"
                data-cursor="hover"
                class="text-sm text-muted transition-colors hover:text-ink"
                @click="go(l.href)"
              >
                {{ l.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- contact -->
        <div>
          <h3 class="text-sm font-semibold text-ink">Masz pytania?</h3>
          <p class="mt-4 text-sm text-muted">
            Napisz lub zadzwoń — odpowiadamy w ciągu 24 godzin.
          </p>
          <a
            href="mailto:kontakt@witrynovo.pl"
            data-cursor="hover"
            class="mt-3 block text-sm font-medium text-ink transition-colors hover:text-brand"
            >kontakt@witrynovo.pl</a
          >
          <a
            href="tel:+48000000000"
            data-cursor="hover"
            class="mt-1 block text-sm font-medium text-ink transition-colors hover:text-brand"
            >+48 000 000 000</a
          >
        </div>
      </div>

      <div
        class="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-sm text-muted md:flex-row"
      >
        <p>© {{ year }} witrynovo.pl. Wszelkie prawa zastrzeżone.</p>
        <div class="flex gap-5">
          <a href="#" data-cursor="hover" class="transition-colors hover:text-ink">Polityka prywatności</a>
          <a href="#" data-cursor="hover" class="transition-colors hover:text-ink">Regulamin</a>
        </div>
      </div>
    </div>
  </footer>
</template>
