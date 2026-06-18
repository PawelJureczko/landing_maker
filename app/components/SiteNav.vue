<script setup lang="ts">
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 24)

const { $lenis } = useNuxtApp() as unknown as { $lenis?: { scrollTo: (t: string | number, o?: object) => void } }

const links = [
  { label: 'Funkcje', href: '#features' },
  { label: 'Jak to działa', href: '#how' },
  { label: 'Przykłady', href: '#templates' },
  { label: 'Cennik', href: '#pricing' },
]

function go(href: string) {
  if ($lenis) $lenis.scrollTo(href, { offset: -80, duration: 1.4 })
  else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-[80] flex justify-center px-4 pt-4 transition-all duration-500"
  >
    <nav
      class="flex w-full max-w-5xl items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-500"
      :class="
        scrolled
          ? 'border-line/80 bg-paper/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      "
    >
      <button
        class="group flex items-center gap-2"
        data-cursor="hover"
        @click="go('#top')"
      >
        <PlumeLogo class="h-7 w-7" />
        <span class="text-lg font-extrabold tracking-tight text-ink">[TwojaMarka]</span>
      </button>

      <div class="hidden items-center gap-1 md:flex">
        <button
          v-for="l in links"
          :key="l.href"
          data-cursor="hover"
          class="relative rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          @click="go(l.href)"
        >
          {{ l.label }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle />
        <button
          data-cursor="hover"
          class="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-transform duration-300 hover:scale-105 active:scale-95"
          @click="go('#pricing')"
        >
          Odbierz projekt
        </button>
      </div>
    </nav>
  </header>
</template>
