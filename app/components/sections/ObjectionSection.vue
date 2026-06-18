<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
useReveal(root, { childSelector: '[data-obj]', y: 40, stagger: 0.1 })

const points = [
  {
    t: 'Klienci szukają w Google, nie na Facebooku',
    b: 'Gdy ktoś wpisuje „[usługa] w okolicy”, profil na Facebooku rzadko ląduje wysoko. Strona z lokalnym SEO — tak. To tam zdobywasz albo tracisz klientów.',
  },
  {
    t: 'Strona budzi większe zaufanie',
    b: 'Własny adres wygląda poważnie. „Skoro ma stronę, to konkretna firma” — a profil to jeden z tysięcy podobnych obok siebie.',
  },
  {
    t: 'Rezerwacje i kontakt przez całą dobę',
    b: 'Klient o 22:00 rezerwuje wizytę albo dzwoni jednym kliknięciem. Post na Facebooku tego nie załatwi.',
  },
  {
    t: 'To Twoje — nie platformy',
    b: 'Algorytm tnie zasięgi, konto można stracić z dnia na dzień. Strona należy do Ciebie i działa zawsze, niezależnie od kaprysów Facebooka.',
  },
]
</script>

<template>
  <section ref="root" class="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-12 md:py-32">
    <div class="mb-12 max-w-2xl" data-obj>
      <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Bez ściemy
      </p>
      <h2 class="display text-[clamp(2rem,5vw,4rem)] text-ink">
        „Mam Facebooka.<br /><span class="text-gradient">Po co mi strona?”</span>
      </h2>
      <p class="mt-5 text-lg text-muted">
        Słyszymy to często — i rozumiemy. Ale oto cztery rzeczy, których profil
        na Facebooku po prostu nie zrobi:
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="(p, i) in points"
        :key="p.t"
        data-obj
        data-cursor="hover"
        class="group relative flex gap-5 rounded-3xl border border-line bg-paper-soft p-7 transition-colors duration-500 hover:border-brand/40"
      >
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand"
          aria-hidden="true"
          >{{ i + 1 }}</span
        >
        <div>
          <h3 class="text-lg font-bold text-ink">{{ p.t }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ p.b }}</p>
        </div>
      </article>
    </div>

    <p
      data-obj
      class="mx-auto mt-10 max-w-2xl text-balance text-center text-lg font-medium text-ink"
    >
      Strona nie zastępuje Facebooka —
      <span class="text-gradient">sprawia, że Twoja firma wygląda i działa profesjonalnie wszędzie.</span>
    </p>
  </section>
</template>
