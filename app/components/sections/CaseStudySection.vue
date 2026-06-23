<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
const shot = ref<HTMLElement | null>(null)
useReveal(root, { childSelector: '[data-cs]', y: 40, stagger: 0.12 })
useTilt(shot, 6)
</script>

<template>
  <section
    ref="root"
    class="theme-fade relative overflow-hidden bg-panel py-12 text-panel-fg md:py-28"
  >
    <AuroraBackground :intensity="0.28" />
    <div
      class="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2"
    >
      <!-- left: testimonial -->
      <div>
        <p
          data-cs
          class="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand"
        >
          Nasza realizacja
        </p>

        <blockquote
          data-cs
          class="text-balance text-2xl font-medium leading-snug md:text-[1.75rem]"
        >
          „To nie jest po prostu ładna strona - to
          <span class="text-gradient"
            >narzędzie, które realnie pomaga nam zdobywać klientów</span
          >. witrynovo.pl świetnie wyczuli klimat naszego barbershopu i
          przełożyli go na stronę, która wygląda dobrze i działa jeszcze
          lepiej.”
        </blockquote>

        <div data-cs class="mt-7 flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand via-brand-2 to-brand-3 text-sm font-bold text-white"
            aria-hidden="true"
          >
            RS
          </div>
          <div>
            <p class="font-semibold">Razor Sznyt</p>
            <p class="text-sm text-panel-fg/60">Barber shop · Knurów</p>
          </div>
        </div>

        <!-- before → after -->
        <div data-cs class="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span
            class="rounded-full border border-panel-fg/15 px-3 py-1 text-panel-fg/60"
            >Wcześniej: tylko Instagram i Facebook</span
          >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true" class="text-panel-fg/40">
            <path d="M2 8h15M12 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="rounded-full bg-brand/25 px-3 py-1 font-medium text-brand-4"
            >Dziś: własna strona</span
          >
        </div>

        <a
          data-cs
          href="https://razorsznyt.pl"
          target="_blank"
          rel="noopener"
          data-cursor="hover"
          class="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-panel-fg transition-colors hover:text-brand-4"
        >
          Zobacz na żywo: razorsznyt.pl
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="transition-transform group-hover:translate-x-1">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>

      <!-- right: framed real screenshot -->
      <div data-cs class="[perspective:1400px]">
        <div
          ref="shot"
          class="overflow-hidden rounded-2xl border border-panel-fg/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] will-change-transform"
        >
          <div class="flex items-center gap-2 border-b border-panel-fg/10 bg-white/5 px-4 py-3">
            <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span class="h-3 w-3 rounded-full bg-[#28c840]" />
            <div class="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-xs text-panel-fg/50">
              razorsznyt.pl
            </div>
          </div>
          <img
            src="/img/razorsznyt.png"
            alt="Strona internetowa barbershopu Razor Sznyt, którą stworzyliśmy"
            class="block w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
