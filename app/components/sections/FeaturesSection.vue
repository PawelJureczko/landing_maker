<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
useReveal(root, { childSelector: '[data-card]', y: 50, stagger: 0.1 })
</script>

<template>
  <section id="features" ref="root" class="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-12 md:py-32">
    <div class="mb-16 max-w-2xl">
      <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Co zyskujesz
      </p>
      <h2 class="display text-[clamp(2rem,5vw,4rem)] text-ink">
        Mniej zachodu.<br /><span class="text-gradient">Więcej klientów.</span>
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-4 md:auto-rows-[minmax(180px,auto)] md:grid-cols-3">
      <!-- big -->
      <article
        data-card
        data-cursor="hover"
        class="group relative col-span-1 flex flex-col justify-start overflow-hidden rounded-3xl border border-line bg-paper-soft p-8 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(109,94,252,0.5)] md:col-span-2 md:row-span-2 md:justify-between"
      >
        <AuroraBackground :intensity="0.18" />
        <div class="relative z-10">
          <span class="text-xs font-semibold uppercase tracking-widest text-brand"
            >Najważniejsze</span
          >
          <h3 class="mt-3 text-3xl font-bold text-ink">
            Klienci, którzy i tak Cię szukają — trafią właśnie do Ciebie.
          </h3>
          <p class="mt-3 max-w-md text-muted">
            Codziennie ktoś wpisuje w Google „[Twoja usługa] w okolicy”. Bez
            strony lądują u konkurencji. Twoja strona zamienia te wyszukiwania w
            telefony, wizyty i rezerwacje.
          </p>
        </div>
        <div class="relative z-10 mt-8 scale-[0.92] origin-bottom-left transition-transform duration-500 group-hover:scale-95">
          <BrowserMockup url="twojafirma.pl" accent="#a855f7" />
        </div>
      </article>

      <FeatureCard
        icon="bolt"
        title="Gotowe w kilka dni"
        body="Wypełniasz formularz, resztę robimy my. Zero stawiania czegokolwiek samemu."
      />
      <FeatureCard
        icon="wand"
        title="Wyglądasz profesjonalnie"
        body="Prawdziwa strona budzi zaufanie. Wyróżniasz się od konkurencji, która ma tylko profil na Facebooku — i świetnie wygląda na telefonie."
      />
      <FeatureCard
        icon="chart"
        title="Znajdą Cię w Google"
        body="Optymalizujemy stronę pod lokalne wyszukiwania — gdy ktoś szuka „[usługa] [miasto]”, pokazujesz się właśnie Ty."
        wide
      />
      <FeatureCard
        icon="lock"
        title="Zero technicznych zmartwień"
        body="Hosting, domena, bezpieczeństwo, drobne zmiany — wszystkim zajmujemy się my. Ty robisz swoje."
      />
      <FeatureCard
        icon="forms"
        title="Rezerwacje i kontakt od ręki"
        body="Przycisk rezerwacji (Booksy, Calendly), telefon, mapa, godziny otwarcia — klient działa jednym kliknięciem."
      />
    </div>
  </section>
</template>
